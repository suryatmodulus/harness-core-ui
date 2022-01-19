import type { SelectOption, MultiSelectOption } from '@wings-software/uicore'

export const PrometheusMonitoringSourceFieldNames = {
  METRIC_IDENTIFIER: 'identifier',
  METRIC_NAME: 'metricName',
  PROMETHEUS_METRIC: 'prometheusMetric',
  SERVICE_FILTER: 'serviceFilter',
  RISK_CATEGORY: 'riskCategory',
  RECORD_COUNT: 'recordCount',
  QUERY: 'query',
  ENVIRONMENT_FILTER: 'envFilter',
  ADDITIONAL_FILTER: 'additionalFilter',
  HIGHER_BASELINE_DEVIATION: 'higherBaselineDeviation',
  LOWER_BASELINE_DEVIATION: 'lowerBaselineDeviation',
  AGGREGATOR: 'aggregator',
  SERVICE_INSTANCE: 'serviceInstance',
  GROUP_NAME: 'groupName',
  IS_MANUAL_QUERY: 'isManualQuery',
  CONTINUOUS_VERIFICATION: 'continuousVerification',
  HEALTH_SCORE: 'healthScore',
  SLI: 'sli'
}

export interface PrometheusSetupSource {
  isEdit: boolean
  mappedServicesAndEnvs: Map<string, MapPrometheusQueryToService> // metricName to MapPrometheusQueryToService
  healthSourceIdentifier: string
  healthSourceName: string
  product: SelectOption
  connectorRef?: string
}

export type MapPrometheusQueryToService = {
  metricName: string
  prometheusMetric?: string
  query: string
  isManualQuery: boolean
  serviceFilter?: MultiSelectOption[]
  envFilter?: MultiSelectOption[]
  additionalFilter?: MultiSelectOption[]
  aggregator?: string
  riskCategory?: string
  serviceInstance?: string
  recordCount?: number
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
  groupName?: SelectOption
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  identifier: string
}

export type RiskProfileCatgory = 'Performance' | 'Errors' | 'Infrastructure'
export type PrometheusFilter = { labelName: string; labelValue: string }

export type SelectedAndMappedMetrics = {
  selectedMetric: string
  mappedMetrics: Map<string, MapPrometheusQueryToService>
}

export type CreatedMetricsWithSelectedIndex = {
  createdMetrics: string[]
  selectedMetricIndex: number
  createdMetricsIdentifiers: string[]
}

export const PrometheusProductNames = {
  APM: 'apm'
}
