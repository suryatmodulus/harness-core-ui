import type { SelectOption } from '@wings-software/uicore'
import { isNumber } from 'lodash-es'
import type { FormikProps } from 'formik'
import type { MultiSelectOption } from '@wings-software/uicore'
import type {
  MetricDefinition,
  PrometheusFilter,
  PrometheusHealthSourceSpec,
  TimeSeriesMetricDefinition
} from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'
import {
  CreatedMetricsWithSelectedIndex,
  PrometheusMonitoringSourceFieldNames,
  SelectedAndMappedMetrics,
  PrometheusSetupSource,
  RiskProfileCatgory,
  MapPrometheusQueryToService,
  PrometheusProductNames
} from './PrometheusHealthSource.constants'
import { HealthSourceTypes } from '../../types'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'

type UpdateSelectedMetricsMap = {
  updatedMetric: string
  oldMetric: string
  mappedMetrics: Map<string, MapPrometheusQueryToService>
  formikProps: FormikProps<MapPrometheusQueryToService | undefined>
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
    updatedMap.set(updatedMetric, { metricName: updatedMetric, query: '', isManualQuery: false })
  }

  // update map with current form data
  if (formikProps.values?.metricName) {
    updatedMap.set(formikProps.values.metricName, formikProps.values as MapPrometheusQueryToService)
  }
  return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
}

export function initializeSelectedMetricsMap(
  defaultSelectedMetricName: string,
  mappedServicesAndEnvs?: Map<string, MapPrometheusQueryToService>
): SelectedAndMappedMetrics {
  return {
    selectedMetric: (Array.from(mappedServicesAndEnvs?.keys() || [])?.[0] as string) || defaultSelectedMetricName,
    mappedMetrics:
      mappedServicesAndEnvs ||
      new Map([[defaultSelectedMetricName, { metricName: defaultSelectedMetricName, isManualQuery: false, query: '' }]])
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
  values?: MapPrometheusQueryToService
): { [fieldName: string]: string } {
  const requiredFieldErrors = {
    [PrometheusMonitoringSourceFieldNames.ENVIRONMENT_FILTER]: getString(
      'cv.monitoringSources.prometheus.validation.filterOnEnvironment'
    ),
    [PrometheusMonitoringSourceFieldNames.METRIC_NAME]: getString('cv.monitoringSources.metricNameValidation'),
    [PrometheusMonitoringSourceFieldNames.PROMETHEUS_METRIC]: getString(
      'cv.monitoringSources.prometheus.validation.promethusMetric'
    ),
    [PrometheusMonitoringSourceFieldNames.GROUP_NAME]: getString(
      'cv.monitoringSources.prometheus.validation.groupName'
    ),
    [PrometheusMonitoringSourceFieldNames.RISK_CATEGORY]: getString(
      'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory'
    ),
    [PrometheusMonitoringSourceFieldNames.SERVICE_FILTER]: getString(
      'cv.monitoringSources.prometheus.validation.filterOnService'
    ),
    [PrometheusMonitoringSourceFieldNames.QUERY]: getString(
      'cv.monitoringSources.gco.manualInputQueryModal.validation.query'
    )
  }

  if (!values) {
    return requiredFieldErrors
  }

  if (values.isManualQuery) {
    delete requiredFieldErrors[PrometheusMonitoringSourceFieldNames.SERVICE_FILTER]
    delete requiredFieldErrors[PrometheusMonitoringSourceFieldNames.ENVIRONMENT_FILTER]
    delete requiredFieldErrors[PrometheusMonitoringSourceFieldNames.SERVICE_INSTANCE]
    delete requiredFieldErrors[PrometheusMonitoringSourceFieldNames.PROMETHEUS_METRIC]
  }

  for (const fieldName of Object.keys(requiredFieldErrors)) {
    switch (fieldName) {
      case PrometheusMonitoringSourceFieldNames.ENVIRONMENT_FILTER:
        if (values.envFilter?.length) delete requiredFieldErrors[fieldName]
        break
      case PrometheusMonitoringSourceFieldNames.SERVICE_FILTER:
        if (values.serviceFilter?.length) delete requiredFieldErrors[fieldName]
        break
      default:
        if ((values as any)[fieldName]) delete requiredFieldErrors[fieldName]
    }
  }

  if (values.lowerBaselineDeviation !== true && values.higherBaselineDeviation !== true) {
    requiredFieldErrors[PrometheusMonitoringSourceFieldNames.LOWER_BASELINE_DEVIATION] = getString(
      'cv.monitoringSources.prometheus.validation.deviation'
    )
  }

  const duplicateNames = createdMetrics?.filter((metricName, index) => {
    if (index === selectedMetricIndex) {
      return false
    }
    return metricName === values.metricName
  })

  if (values.metricName && duplicateNames.length) {
    requiredFieldErrors[PrometheusMonitoringSourceFieldNames.METRIC_NAME] = getString(
      'cv.monitoringSources.prometheus.validation.metricNameUnique'
    )
  }

  if (
    !requiredFieldErrors[PrometheusMonitoringSourceFieldNames.QUERY] &&
    isNumber(values.recordCount) &&
    values.recordCount > 1
  ) {
    requiredFieldErrors[PrometheusMonitoringSourceFieldNames.QUERY] = getString(
      'cv.monitoringSources.prometheus.validation.recordCount'
    )
  }

  return requiredFieldErrors
}

export function initializePrometheusGroupNames(
  mappedMetrics: Map<string, MapPrometheusQueryToService>,
  getString: UseStringsReturn['getString']
): SelectOption[] {
  const groupNames = Array.from(mappedMetrics?.entries())
    .map(metric => {
      const { groupName } = metric?.[1] || {}
      return groupName || null
    })
    .filter(groupItem => groupItem !== null) as SelectOption[]
  return [{ label: getString('cv.addNew'), value: '' }, ...groupNames]
}

export function transformLabelToPrometheusFilter(options?: MultiSelectOption[]): PrometheusFilter[] {
  const filters: PrometheusFilter[] = []
  if (!options?.length) {
    return filters
  }

  for (const option of options) {
    const value = option.label.split(':')
    filters.push({ labelName: value[0], labelValue: value[1] })
  }

  return filters
}

function generateMultiSelectOptionListFromPrometheusFilter(filters?: PrometheusFilter[]): MultiSelectOption[] {
  if (!filters?.length) {
    return []
  }

  const options: MultiSelectOption[] = []
  for (const filter of filters) {
    if (filter?.labelName && filter.labelValue) {
      options.push({ label: `${filter.labelName}:${filter.labelValue}`, value: filter.labelValue })
    }
  }

  return options
}

export function transformPrometheusHealthSourceToSetupSource(sourceData: any): PrometheusSetupSource {
  const healthSource: UpdatedHealthSource = sourceData?.healthSourceList?.find(
    (source: UpdatedHealthSource) => source.name === sourceData.healthSourceName
  )

  if (!healthSource) {
    return {
      isEdit: false,
      healthSourceIdentifier: sourceData.healthSourceIdentifier,
      mappedServicesAndEnvs: new Map([
        ['Prometheus Metric', { metricName: 'Prometheus Metric', isManualQuery: false, query: '' }]
      ]),
      healthSourceName: sourceData.healthSourceName,
      connectorRef: sourceData.connectorRef,
      product: { label: PrometheusProductNames.APM, value: PrometheusProductNames.APM }
    }
  }

  const setupSource: PrometheusSetupSource = {
    isEdit: sourceData.isEdit,
    mappedServicesAndEnvs: new Map(),
    healthSourceIdentifier: sourceData.healthSourceIdentifier,
    healthSourceName: sourceData.healthSourceName,
    product: sourceData.product,
    connectorRef: sourceData.connectorRef
  }

  for (const metricDefinition of (healthSource?.spec as PrometheusHealthSourceSpec)?.metricDefinitions || []) {
    if (metricDefinition?.metricName) {
      setupSource.mappedServicesAndEnvs.set(metricDefinition.metricName, {
        metricName: metricDefinition.metricName,
        prometheusMetric: metricDefinition.prometheusMetric,
        query: metricDefinition.query || '',
        isManualQuery: metricDefinition.isManualQuery || false,
        serviceFilter: generateMultiSelectOptionListFromPrometheusFilter(metricDefinition.serviceFilter),
        envFilter: generateMultiSelectOptionListFromPrometheusFilter(metricDefinition.envFilter),
        additionalFilter: generateMultiSelectOptionListFromPrometheusFilter(metricDefinition.additionalFilters),
        aggregator: metricDefinition.aggregation,
        riskCategory: `${metricDefinition.riskProfile?.category}/${metricDefinition.riskProfile?.metricType}`,
        serviceInstance: metricDefinition.serviceInstanceFieldName,
        lowerBaselineDeviation: metricDefinition.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER') || false,
        higherBaselineDeviation: metricDefinition.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER') || false,
        groupName: { label: metricDefinition.groupName || '', value: metricDefinition.groupName || '' }
      })
    }
  }

  return setupSource
}

export function transformPrometheusSetupSourceToHealthSource(setupSource: PrometheusSetupSource): UpdatedHealthSource {
  const dsConfig: UpdatedHealthSource = {
    type: HealthSourceTypes.Prometheus as UpdatedHealthSource['type'],
    identifier: setupSource.healthSourceIdentifier,
    name: setupSource.healthSourceName,
    spec: {
      connectorRef: setupSource?.connectorRef,
      feature: PrometheusProductNames.APM,
      metricDefinitions: []
    }
  }

  for (const entry of setupSource.mappedServicesAndEnvs.entries()) {
    const {
      envFilter,
      metricName,
      groupName,
      prometheusMetric,
      serviceFilter,
      serviceInstance,
      isManualQuery,
      query,
      aggregator,
      additionalFilter,
      riskCategory,
      lowerBaselineDeviation,
      higherBaselineDeviation
    }: MapPrometheusQueryToService = entry[1]

    if (!groupName || !metricName || !riskCategory) {
      continue
    }

    if (!isManualQuery && (!prometheusMetric || !envFilter || !serviceFilter)) {
      continue
    }

    const [category, metricType] = riskCategory?.split('/') || []
    const thresholdTypes: TimeSeriesMetricDefinition['thresholdType'][] = []
    if (lowerBaselineDeviation) {
      thresholdTypes.push('ACT_WHEN_LOWER')
    }
    if (higherBaselineDeviation) {
      thresholdTypes.push('ACT_WHEN_HIGHER')
    }

    ;(dsConfig.spec as any).metricDefinitions.push({
      prometheusMetric,
      metricName,
      serviceFilter: transformLabelToPrometheusFilter(serviceFilter),
      isManualQuery,
      query,
      envFilter: transformLabelToPrometheusFilter(envFilter),
      additionalFilters: transformLabelToPrometheusFilter(additionalFilter),
      aggregation: aggregator,
      serviceInstanceFieldName: serviceInstance,
      groupName: groupName.value as string,
      riskProfile: {
        category: category as RiskProfileCatgory,
        metricType: metricType as MetricDefinition['type'],
        thresholdTypes
      }
    })
  }

  return dsConfig
}
