/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep } from 'lodash-es'
import type { FormikProps } from 'formik'
import type { SelectOption } from '@wings-software/uicore'
import type { StringKeys } from 'framework/strings'
import type { MetricPackDTO } from 'services/cv'
import type {
  CreatedMetricsWithSelectedIndex,
  MapNewRelicMetric,
  NewRelicData,
  SelectedAndMappedMetrics
} from './NewRelicHealthSource.types'
import { NewRelicHealthSourceFieldNames } from './NewRelicHealthSource.constants'

export const validateMapping = (
  values: any,
  createdMetrics: string[],
  selectedMetricIndex: number,
  getString: (key: StringKeys) => string
): ((key: string | boolean | string[]) => string) => {
  let errors = {} as any

  const metricValueList = Object.values(values?.metricData).filter(val => val)
  if (!metricValueList.length) {
    errors['metricData'] = getString('cv.monitoringSources.appD.validations.selectMetricPack')
  }

  if (
    values?.newRelicApplication &&
    (!values.newRelicApplication.value || values.newRelicApplication.value === 'loading')
  ) {
    errors['newRelicApplication'] = getString('cv.healthSource.connectors.NewRelic.validations.application')
  }

  // if custom metrics are present then validate custom metrics form
  if (values?.showCustomMetric) {
    errors = validateCustomMetricFields(values, createdMetrics, selectedMetricIndex, errors, getString)
  }

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

  const isAssignComponentValid = [values.sli, values.continuousVerification, values.healthScore].find(i => i)
  const isRiskCategoryValid = !!values?.riskCategory

  const duplicateNames = createdMetrics?.filter((metricName, index) => {
    if (index === selectedMetricIndex) {
      return false
    }
    return metricName === values.metricName
  })

  if (!values.groupName || !values.groupName?.value) {
    completErrors['groupName'] = getString('cv.monitoringSources.prometheus.validation.groupName')
  }

  if (!values.metricName) {
    completErrors['metricName'] = getString('cv.monitoringSources.metricNameValidation')
  }

  if (!values.query) {
    completErrors['query'] = getString('cv.healthSource.connectors.NewRelic.validations.nrql')
  }

  if (!values.metricValue) {
    completErrors['metricValue'] = getString('cv.healthSource.connectors.NewRelic.validations.metricValue')
  }

  if (!values.timestamp) {
    completErrors['timestamp'] = getString('cv.healthSource.connectors.NewRelic.validations.timestamp')
  }

  if (values.metricName && duplicateNames.length) {
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

export function initializeSelectedMetricsMap(
  defaultSelectedMetricName: string,
  mappedServicesAndEnvs?: Map<string, MapNewRelicMetric>
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
            groupName: { label: '', value: '' },
            query: '',
            metricValue: '',
            timestamp: '',
            timestampFormat: '',
            serviceInstanceIdentifier: '',
            sli: false,
            healthScore: false,
            continuousVerification: false
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

export const convertMetricPackToMetricData = (value?: MetricPackDTO[]) => {
  const dataObject: { [key: string]: boolean } = {}
  const metricList: MetricPackDTO[] = value || []
  metricList.forEach((i: MetricPackDTO) => (dataObject[i.identifier as string] = true))
  return dataObject
}

export const initializeNonCustomFields = (newRelicData: NewRelicData) => {
  return {
    newRelicApplication: { label: newRelicData?.applicationName, value: newRelicData?.applicationId },
    metricPacks: newRelicData?.metricPacks || undefined,
    metricData: convertMetricPackToMetricData(newRelicData?.metricPacks)
  }
}

export const createNewRelicFormData = (
  newRelicData: NewRelicData,
  mappedMetrics: Map<string, MapNewRelicMetric>,
  selectedMetric: string,
  nonCustomFeilds: {
    newRelicApplication: SelectOption
    metricPacks?: MetricPackDTO[]
    metricData: {
      [key: string]: boolean
    }
  },
  showCustomMetric: boolean
): any => {
  return {
    name: newRelicData.name,
    identifier: newRelicData.identifier,
    connectorRef: newRelicData.connectorRef,
    isEdit: newRelicData.isEdit,
    product: newRelicData.product,
    type: newRelicData.type,
    mappedServicesAndEnvs: newRelicData.mappedServicesAndEnvs,
    ...nonCustomFeilds,
    ...mappedMetrics.get(selectedMetric),
    metricName: selectedMetric,
    showCustomMetric
  }
}

export const createNewRelicPayloadBeforeSubmission = (
  formik: FormikProps<MapNewRelicMetric>,
  mappedMetrics: Map<string, MapNewRelicMetric>,
  selectedMetric: string,
  selectedMetricIndex: number,
  createdMetrics: string[],
  getString: (key: StringKeys) => string,
  onSubmit: (healthSourcePayload: any) => void
): void => {
  formik.setTouched({
    ...formik.touched,
    [NewRelicHealthSourceFieldNames.NEWRELIC_APPLICATION]: true,
    [NewRelicHealthSourceFieldNames.METRIC_DATA]: { Performance: true },

    [NewRelicHealthSourceFieldNames.METRIC_NAME]: true,
    [NewRelicHealthSourceFieldNames.GROUP_NAME]: true,

    [NewRelicHealthSourceFieldNames.NEWRELIC_QUERY]: true,

    [NewRelicHealthSourceFieldNames.METRIC_VALUE]: true,
    [NewRelicHealthSourceFieldNames.TIMESTAMP_LOCATOR]: true,
    [NewRelicHealthSourceFieldNames.TIMESTAMP_FORMAT]: true,

    [NewRelicHealthSourceFieldNames.SLI]: true,
    [NewRelicHealthSourceFieldNames.CONTINUOUS_VERIFICATION]: true,
    [NewRelicHealthSourceFieldNames.LOWER_BASELINE_DEVIATION]: true,
    [NewRelicHealthSourceFieldNames.RISK_CATEGORY]: true
  })
  const errors = validateMapping(formik.values, createdMetrics, selectedMetricIndex, getString)
  if (Object.keys(errors || {})?.length > 0) {
    formik.validateForm()
    return
  }
  const updatedMetric = formik.values
  if (updatedMetric) {
    mappedMetrics.set(selectedMetric, updatedMetric)
  }
  const updatedValues = { ...formik.values, mappedServicesAndEnvs: mappedMetrics }
  onSubmit(updatedValues)
}

export const setNewRelicApplication = (
  newRelicApplication: string,
  applicationOptions: SelectOption[]
): SelectOption | undefined =>
  !newRelicApplication
    ? { label: '', value: '' }
    : applicationOptions.find((item: SelectOption) => item.label === newRelicApplication)
