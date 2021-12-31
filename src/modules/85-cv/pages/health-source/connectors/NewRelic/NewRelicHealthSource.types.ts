import type { SelectOption } from '@wings-software/uicore'
import type { MetricPackDTO } from 'services/cv'
import type { HealthSourceTypes } from '../../types'

export type MapNewRelicMetric = {
  metricName: string
  groupName: SelectOption
  query: string
  metricValue: string
  timestamp: string
  timestampFormat: string
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  riskCategory?: string
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
}

export type SelectedAndMappedMetrics = {
  selectedMetric: string
  mappedMetrics: Map<string, MapNewRelicMetric>
}

export type CreatedMetricsWithSelectedIndex = {
  createdMetrics: string[]
  selectedMetricIndex: number
}

export interface NewRelicData {
  name: string
  identifier: string
  connectorRef: { connector: { identifier: string } }
  isEdit: boolean
  product: string
  type: HealthSourceTypes
  applicationName: string
  applicationId: string
  metricPacks?: MetricPackDTO[]
  mappedServicesAndEnvs: Map<string, MapNewRelicMetric>
}
