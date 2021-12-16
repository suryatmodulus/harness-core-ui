import type { SelectOption } from '@wings-software/uicore'
import type { MetricPackDTO } from 'services/cv'
import type { HealthSourceTypes } from '../../types'
import type { BasePathData } from './Components/BasePath/BasePath.types'
import type { MetricPathData } from './Components/MetricPath/MetricPath.types'

export type MapAppDynamicsMetric = {
  metricName: string
  riskCategory?: string
  serviceInstance?: string
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
  groupName?: SelectOption
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  basePath: BasePathData
  metricPath: MetricPathData
  appdApplication: string
  appDTier: string
  metricPacks?: MetricPackDTO[]
  metricData: { [key: string]: boolean }
  serviceInstanceMetricPath?: string
  metricIdentifier?: string
}

export type SelectedAndMappedMetrics = {
  selectedMetric: string
  mappedMetrics: Map<string, MapAppDynamicsMetric>
}

export type CreatedMetricsWithSelectedIndex = {
  createdMetrics: string[]
  selectedMetricIndex: number
}

export interface AppDynamicsData {
  name: string
  identifier: string
  connectorRef: { connector: { identifier: string } }
  isEdit: boolean
  product: string
  type: HealthSourceTypes
  applicationName: string
  tierName: string
  metricPacks?: MetricPackDTO[]
  showCustomMetric?: boolean
  mappedServicesAndEnvs: Map<string, MapAppDynamicsMetric>
}

export interface AppDynamicsFomikFormInterface {
  name: string
  identifier: string
  connectorRef: { connector: { identifier: string } }
  isEdit: boolean
  product: string
  type: HealthSourceTypes
  mappedServicesAndEnvs: Map<string, MapAppDynamicsMetric>
  metricName: string
  showCustomMetric?: boolean
  appdApplication: string
  appDTier: string
  metricPacks?: MetricPackDTO[]
  metricData: {
    [key: string]: boolean
  }
  riskCategory?: string
  serviceInstance?: string
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
  groupName?: SelectOption
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  basePath: BasePathData
  metricPath: MetricPathData
  serviceInstanceMetricPath?: string
  metricIdentifier?: string
}
