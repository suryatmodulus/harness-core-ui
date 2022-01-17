/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep } from 'lodash-es'
import type { FormikProps } from 'formik'
import type {
  CustomHealthMetricDefinition,
  CustomHealthSourceSpec,
  RiskProfile,
  MetricPackDTO,
  useGetMetricPacks
} from 'services/cv'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import type {
  CreatedMetricsWithSelectedIndex,
  MapCustomHealthToService,
  SelectedAndMappedMetrics,
  CustomHealthSourceSetupSource,
  onSubmitCustomHealthSourceInterface
} from './CustomHealthSource.types'
import { HealthSourceTypes } from '../../types'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { CustomHealthSourceFieldNames, defaultMetricName } from './CustomHealthSource.constants'

type UpdateSelectedMetricsMap = {
  updatedMetric: string
  oldMetric: string
  mappedMetrics: Map<string, MapCustomHealthToService>
  formikProps: FormikProps<MapCustomHealthToService | undefined>
}

export function updateSelectedMetricsMap({
  updatedMetric,
  oldMetric,
  mappedMetrics,
  formikProps
}: UpdateSelectedMetricsMap): SelectedAndMappedMetrics {
  const updatedMap = new Map(mappedMetrics)

  // in the case where user updates metric name, update the key for current value
  if (oldMetric !== formikProps.values?.metricName) {
    updatedMap.delete(oldMetric)
  }

  // if newly created metric create form object
  if (!updatedMap.has(updatedMetric)) {
    updatedMap.set(updatedMetric, {
      ...({
        sli: false,
        healthScore: false,
        continuousVerification: false,
        serviceInstanceMetricPath: '',
        metricIdentifier: '',
        baseURL: '',
        pathURL: '',
        metricValue: '',
        timestamp: '',
        timestampFormat: '',
        metricName: updatedMetric,
        queryType: '',
        query: '',
        requestMethod: ''
      } as any)
    })
  }

  // update map with current form data
  if (formikProps.values?.metricName) {
    updatedMap.set(formikProps.values.metricName, formikProps.values as MapCustomHealthToService)
  }
  return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
}

export function initializeSelectedMetricsMap(
  defaultSelectedMetricName: string,
  mappedServicesAndEnvs?: Map<string, MapCustomHealthToService>
): SelectedAndMappedMetrics {
  return {
    selectedMetric: (Array.from(mappedServicesAndEnvs?.keys() || [])?.[0] as string) || defaultSelectedMetricName,
    mappedMetrics:
      mappedServicesAndEnvs ||
      new Map([
        [
          defaultSelectedMetricName,
          {
            metricName: defaultSelectedMetricName,
            query: '',
            queryType: undefined,
            requestMethod: undefined,
            metricIdentifier: '',
            baseURL: '',
            pathURL: '',
            metricValue: '',
            timestamp: '',
            timestampFormat: '',
            serviceInstancePath: '',
            startTime: {
              placeholder: '',
              timestampFormat: 'SECONDS',
              customTimestampFormat: ''
            },
            endTime: {
              placeholder: '',
              timestampFormat: 'SECONDS',
              customTimestampFormat: ''
            }
          }
        ]
      ])
  }
}

export function initializeCreatedMetrics(
  defaultSelectedMetricName: string,
  selectedMetric: string,
  mappedMetrics: SelectedAndMappedMetrics['mappedMetrics']
): CreatedMetricsWithSelectedIndex {
  return {
    createdMetrics: Array.from(mappedMetrics.keys()) || [defaultSelectedMetricName],
    selectedMetricIndex: Array.from(mappedMetrics.keys()).findIndex(metric => metric === selectedMetric)
  }
}

export function validateMappings(
  getString: UseStringsReturn['getString'],
  createdMetrics: string[],
  selectedMetricIndex: number,
  values?: MapCustomHealthToService
): { [fieldName: string]: string } {
  let errors = {}

  errors = validateCustomMetricFields(values, createdMetrics, selectedMetricIndex, {}, getString)

  return errors
}

const validateCustomMetricFields = (
  values: any,
  createdMetrics: string[],
  selectedMetricIndex: number,
  errors: any,
  getString: (key: StringKeys) => string
): ((key: string | boolean | string[]) => string) => {
  let completErrors = cloneDeep(errors)

  const isAssignComponentValid = [values?.sli, values?.continuousVerification, values?.healthScore].find(i => i)
  const isRiskCategoryValid = !!values?.riskCategory

  const duplicateNames = createdMetrics?.filter((metricName, index) => {
    if (index === selectedMetricIndex) {
      return false
    }
    return metricName === values.metricName
  })

  if (!values?.groupName || !values?.groupName?.value) {
    completErrors['groupName'] = getString('cv.monitoringSources.prometheus.validation.groupName')
  }

  if (!values?.metricName) {
    completErrors['metricName'] = getString('cv.monitoringSources.metricNameValidation')
  }

  if (!values?.pathURL) {
    completErrors['pathURL'] = getString('cv.customHealthSource.Querymapping.validation.path')
  }

  if (!values?.startTime?.timestampFormat) {
    completErrors['startTime.timestampFormat'] = getString(
      'cv.customHealthSource.Querymapping.validation.startTime.timestamp'
    )
  }

  if (!values?.startTime?.placeholder) {
    completErrors['startTime.placeholder'] = getString(
      'cv.customHealthSource.Querymapping.validation.startTime.placeholder'
    )
  }

  if (!values?.endTime?.timestampFormat) {
    completErrors['endTime.timestampFormat'] = getString(
      'cv.customHealthSource.Querymapping.validation.endTime.timestamp'
    )
  }

  if (!values?.endTime?.placeholder) {
    completErrors['endTime.placeholder'] = getString('cv.customHealthSource.Querymapping.validation.endTime.timestamp')
  }

  if (values?.requestMethod === 'POST' && !values?.query) {
    completErrors['query'] = getString('cv.customHealthSource.Querymapping.validation.body')
  }

  if (!values?.metricValue) {
    completErrors['metricValue'] = getString('cv.healthSource.connectors.NewRelic.validations.metricValue')
  }

  if (!values?.timestamp) {
    completErrors['timestamp'] = getString('cv.healthSource.connectors.NewRelic.validations.timestamp')
  }

  if (values?.metricName && duplicateNames.length) {
    completErrors['metricName'] = getString('cv.monitoringSources.prometheus.validation.metricNameUnique')
  }

  completErrors = validateAssignComponent(isAssignComponentValid, completErrors, getString, values, isRiskCategoryValid)
  return completErrors
}

const validateAssignComponent = (
  isAssignComponentValid: boolean,
  errors: any,
  getString: (key: StringKeys) => string,
  values: any,
  isRiskCategoryValid: boolean
): ((key: string | boolean | string[]) => string) => {
  const _error = cloneDeep(errors)
  if (!isAssignComponentValid) {
    _error['sli'] = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline')
  } else if (isAssignComponentValid) {
    if (values.continuousVerification || values.healthScore) {
      if (values.lowerBaselineDeviation !== true && values.higherBaselineDeviation !== true) {
        _error['lowerBaselineDeviation'] = getString('cv.monitoringSources.prometheus.validation.deviation')
      }
      if (!isRiskCategoryValid) {
        _error['riskCategory'] = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory')
      }
    }
  }
  return _error
}

export function transformCustomHealthSourceToSetupSource(sourceData: any): CustomHealthSourceSetupSource {
  const healthSource: UpdatedHealthSource = sourceData?.healthSourceList?.find(
    (source: UpdatedHealthSource) => source.name === sourceData.healthSourceName
  )

  if (!healthSource) {
    return {
      isEdit: false,
      healthSourceIdentifier: sourceData.healthSourceIdentifier,
      mappedServicesAndEnvs: new Map([
        [
          defaultMetricName,
          {
            metricName: defaultMetricName,
            identifier: '',
            query: '',
            queryType: undefined,
            requestMethod: undefined,
            metricIdentifier: '',
            baseURL: '',
            pathURL: '',
            metricValue: '',
            timestamp: '',
            timestampFormat: '',
            serviceInstancePath: '',
            startTime: {
              placeholder: '',
              timestampFormat: 'SECONDS',
              customTimestampFormat: ''
            },
            endTime: {
              placeholder: '',
              timestampFormat: 'SECONDS',
              customTimestampFormat: ''
            }
          }
        ]
      ]),
      healthSourceName: sourceData.healthSourceName,
      connectorRef: sourceData.connectorRef
    }
  }

  const setupSource: CustomHealthSourceSetupSource = {
    isEdit: sourceData.isEdit,
    mappedServicesAndEnvs: new Map(),
    healthSourceIdentifier: sourceData.healthSourceIdentifier,
    healthSourceName: sourceData.healthSourceName,
    connectorRef: sourceData.connectorRef
  }

  for (const metricDefinition of (healthSource?.spec as CustomHealthSourceSpec)?.metricDefinitions || []) {
    if (metricDefinition?.metricName) {
      setupSource.mappedServicesAndEnvs.set(metricDefinition.metricName, {
        metricName: metricDefinition.metricName,
        metricIdentifier: metricDefinition.identifier,
        groupName: { label: metricDefinition.groupName || '', value: metricDefinition.groupName || '' },

        // assign section
        continuousVerification: Boolean(metricDefinition?.analysis?.deploymentVerification?.enabled),
        healthScore: Boolean(metricDefinition?.analysis?.liveMonitoring?.enabled),
        sli: Boolean(metricDefinition.sli?.enabled),
        riskCategory:
          metricDefinition?.analysis?.riskProfile?.category && metricDefinition?.analysis?.riskProfile?.metricType
            ? `${metricDefinition?.analysis?.riskProfile?.category}/${metricDefinition?.analysis?.riskProfile?.metricType}`
            : '',
        serviceInstanceIdentifier: metricDefinition?.analysis?.deploymentVerification?.serviceInstanceFieldName,
        lowerBaselineDeviation:
          metricDefinition?.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER') || false,
        higherBaselineDeviation:
          metricDefinition?.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER') || false,

        //
        queryType: metricDefinition.queryType,
        requestMethod: metricDefinition.method,
        query: metricDefinition.requestBody || '*',
        baseURL: '', // get this from connector API
        pathURL: metricDefinition.urlPath || '',
        metricValue: metricDefinition.metricResponseMapping?.metricValueJsonPath || '',
        timestamp: metricDefinition.metricResponseMapping?.timestampJsonPath || '',
        timestampFormat: metricDefinition.metricResponseMapping?.timestampFormat || '',
        serviceInstancePath: metricDefinition.metricResponseMapping?.serviceInstanceJsonPath || '',
        startTime: {
          placeholder: metricDefinition.startTime?.placeholder,
          timestampFormat: metricDefinition.startTime?.timestampFormat,
          customTimestampFormat: metricDefinition.startTime?.customTimestampFormat
        },
        endTime: {
          placeholder: metricDefinition.endTime?.placeholder,
          timestampFormat: metricDefinition.endTime?.timestampFormat,
          customTimestampFormat: metricDefinition.endTime?.customTimestampFormat
        }
      })
    }
  }

  return setupSource
}

export function transformCustomSetupSourceToHealthSource(
  setupSource: CustomHealthSourceSetupSource
): UpdatedHealthSource {
  const dsConfig = {
    type: HealthSourceTypes.CustomHealth as UpdatedHealthSource['type'],
    identifier: setupSource.healthSourceIdentifier,
    name: setupSource.healthSourceName,
    spec: {
      connectorRef: setupSource?.connectorRef,
      metricDefinitions: [] as CustomHealthMetricDefinition[]
    }
  }

  for (const entry of setupSource.mappedServicesAndEnvs.entries()) {
    const {
      metricName,
      metricIdentifier,
      groupName,
      queryType,
      requestMethod,
      query,
      riskCategory,
      lowerBaselineDeviation,
      higherBaselineDeviation,
      sli,
      continuousVerification,
      healthScore,
      pathURL,
      startTime,
      endTime,
      metricValue,
      timestamp,
      timestampFormat
    }: MapCustomHealthToService = entry[1]

    if (!groupName || !metricName) {
      continue
    }

    const [category, metricType] = riskCategory?.split('/') || []
    const thresholdTypes: RiskProfile['thresholdTypes'] = []
    if (lowerBaselineDeviation) {
      thresholdTypes.push('ACT_WHEN_LOWER')
    }
    if (higherBaselineDeviation) {
      thresholdTypes.push('ACT_WHEN_HIGHER')
    }

    dsConfig.spec?.metricDefinitions?.push({
      identifier: metricIdentifier,
      queryType,
      metricName,
      groupName: groupName.value as string,
      urlPath: pathURL,
      method: requestMethod,
      requestBody: query,
      startTime,
      endTime,
      metricResponseMapping: {
        metricValueJsonPath: metricValue,
        timestampJsonPath: timestamp,
        serviceInstanceJsonPath: '',
        timestampFormat: timestampFormat
      },
      sli: { enabled: Boolean(sli) },
      analysis: {
        riskProfile: {
          category: category as RiskProfile['category'],
          metricType: metricType as RiskProfile['metricType'],
          thresholdTypes
        },
        liveMonitoring: { enabled: Boolean(healthScore) },
        deploymentVerification: {
          enabled: Boolean(continuousVerification),
          serviceInstanceFieldName: 'serviceInstance'
        }
      }
    })
  }

  return dsConfig
}

export const onSubmitCustomHealthSource = ({
  formikProps,
  createdMetrics,
  selectedMetricIndex,
  mappedMetrics,
  selectedMetric,
  onSubmit,
  sourceData,
  transformedSourceData,
  getString
}: onSubmitCustomHealthSourceInterface) => {
  return async () => {
    formikProps.setTouched({
      ...formikProps.touched,
      [CustomHealthSourceFieldNames.SLI]: true,
      [CustomHealthSourceFieldNames.GROUP_NAME]: true,
      [CustomHealthSourceFieldNames.METRIC_NAME]: true,
      [CustomHealthSourceFieldNames.LOWER_BASELINE_DEVIATION]: true,
      [CustomHealthSourceFieldNames.RISK_CATEGORY]: true,
      [CustomHealthSourceFieldNames.BASE_URL]: true,
      [CustomHealthSourceFieldNames.METRIC_VALUE]: true,
      [CustomHealthSourceFieldNames.TIMESTAMP_FORMAT]: true,
      [CustomHealthSourceFieldNames.TIMESTAMP_LOCATOR]: true,
      [CustomHealthSourceFieldNames.PATH]: true,
      [CustomHealthSourceFieldNames.QUERY_TYPE]: true,
      startTime: { placeholder: true, timestampFormat: true },
      endTime: { placeholder: true, timestampFormat: true }
    })
    if (formikProps?.values) {
      const errors = validateMappings(getString, createdMetrics, selectedMetricIndex, formikProps.values)
      if (Object.keys(errors || {})?.length > 0) {
        formikProps.validateForm()
        return
      }
    } else {
      return
    }

    const updatedMetric = formikProps.values
    if (updatedMetric) {
      mappedMetrics.set(selectedMetric, updatedMetric)
    }
    await onSubmit(
      sourceData,
      transformCustomSetupSourceToHealthSource({
        ...transformedSourceData,
        mappedServicesAndEnvs: mappedMetrics
      })
    )
  }
}

function getMetricPackDTO(
  identifier: MetricPackDTO['identifier'],
  category: MetricPackDTO['category'],
  metrics: MetricPackDTO['metrics']
): MetricPackDTO {
  return {
    uuid: '2',
    accountId: '',
    orgIdentifier: '',
    projectIdentifier: '',
    dataSourceType: 'CUSTOM_HEALTH',
    identifier,
    category,
    metrics
  }
}

export function generateCustomMetricPack(): ReturnType<typeof useGetMetricPacks> {
  const categories: MetricPackDTO['category'][] = ['ERRORS', 'INFRASTRUCTURE', 'PERFORMANCE']
  const packs: MetricPackDTO[] = []
  for (const category of categories) {
    switch (category) {
      case 'ERRORS':
        packs.push(
          getMetricPackDTO('Errors', 'Errors' as MetricPackDTO['category'], [
            {
              name: 'Errors',
              type: 'ERROR',
              thresholds: [],
              included: false
            }
          ])
        )
        break
      case 'INFRASTRUCTURE':
        packs.push(
          getMetricPackDTO('Infrastructure', 'Infrastructure' as MetricPackDTO['category'], [
            {
              name: 'Infrastructure',
              type: 'INFRA',
              thresholds: [],
              included: false
            }
          ])
        )
        break
      case 'PERFORMANCE':
        packs.push(
          getMetricPackDTO('Performance', 'Performance' as MetricPackDTO['category'], [
            {
              name: 'Throughput',
              type: 'THROUGHPUT',
              thresholds: [],
              included: false
            },
            {
              name: 'Other',
              type: 'ERROR',
              thresholds: [],
              included: false
            },
            {
              name: 'Response Time',
              type: 'RESP_TIME',
              thresholds: [],
              included: false
            }
          ])
        )
    }
  }

  return {
    loading: false,
    error: null,
    data: {
      metaData: {},
      resource: packs
    },
    absolutePath: '',
    cancel: () => undefined,
    refetch: () => Promise.resolve(),
    response: null
  }
}
