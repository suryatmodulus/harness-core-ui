import type { SelectOption } from '@wings-software/uicore'
import type { DatadogDashboardDTO } from 'services/cv'
import type { StringKeys } from 'framework/strings'
import type { UpdatedHealthSource } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'

export type DatadogAggregation = {
  value: DatadogAggregationType
  label: StringKeys
}
export type DatadogAggregationType = 'avg' | 'max' | 'min' | 'sum'

export interface DatadogMetricInfo {
  identifier?: string
  groupName?: SelectOption
  dashboardId?: string
  metricPath?: string
  metricName?: string
  metric?: string
  aggregator?: DatadogAggregationType
  query?: string
  groupingQuery?: string
  metricTags?: SelectOption[]
  serviceInstanceIdentifierTag?: string
  riskCategory?: string
  higherBaselineDeviation?: boolean
  lowerBaselineDeviation?: boolean
  isManualQuery?: boolean
  tooManyMetrics?: boolean
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  isNew?: boolean
}

export interface DatadogMetricSetupSource {
  isEdit: boolean
  metricDefinition: Map<string, DatadogMetricInfo>
  selectedDashboards: DatadogDashboardDTO[]
  healthSourceIdentifier: string
  healthSourceName: string
  product: SelectOption
  connectorRef?: string
}

export interface DatadogMetricsHealthSourceProps {
  data: any
  onSubmit: (formdata: DatadogMetricSetupSource, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
}
