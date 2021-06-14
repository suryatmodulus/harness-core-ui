import type { SelectOption } from '@wings-software/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { DSConfig, TimeSeriesMetricDefinition, StackdriverDashboardDTO } from 'services/cv'
import type { MapGCOLogsQueryToService } from './MapQueriesToHarnessService/types'

export const GCOProduct = {
  CLOUD_METRICS: 'Cloud Metrics',
  CLOUD_LOGS: 'Cloud Logs'
}

export const MANUAL_QUERY_DASHBOARD = 'Manual_Query_Dashboard'

export interface GCOMetricInfo {
  dashboardName?: string
  dashboardPath?: string
  metricName?: string
  query?: string
  environment?: SelectOption
  service?: SelectOption
  metricTags?: { [key: string]: string }
  riskCategory?: string
  higherBaselineDeviation?: boolean
  lowerBaselineDeviation?: boolean
  isManualQuery?: boolean
}

export interface GCOMonitoringSourceInfo
  extends Omit<DSConfig, 'lastUpdatedAt' | 'activitySourceConfigs' | 'connectorIdentifier' | 'monitoringSourceName'> {
  selectedMetrics: Map<string, GCOMetricInfo>
  selectedDashboards: StackdriverDashboardDTO[]
  connectorRef?: SelectOption
  product: string
  name?: string
  mappedServicesAndEnvs: Map<string, MapGCOLogsQueryToService>
  isEdit?: boolean
  identifier?: string
}

// --------------------------------------  DTO's for backend --------------------------------------
export interface GCODefinition {
  isManualQuery?: boolean
  jsonMetricDefinition: Record<string, any>
  metricName: string
  dashboardName: string
  dashboardPath?: string
  metricTags: string[]
  riskProfile: {
    category: 'Performance' | 'Errors' | 'Infrastructure'
    metricType: TimeSeriesMetricDefinition['metricType']
    thresholdTypes: TimeSeriesMetricDefinition['thresholdType'][]
  }
}

export interface GCOConfiguration {
  metricDefinition: GCODefinition
  serviceIdentifier: string
  envIdentifier: string
}

export interface GCODSConfig extends DSConfig {
  metricConfigurations: GCOConfiguration[]
}

// ------------------------------------------------------------------------------------------------

export function buildGCOMetricInfo({
  dashboardName,
  metricName,
  query,
  metricTags,
  isManualQuery,
  dashboardPath
}: Pick<
  GCOMetricInfo,
  'dashboardName' | 'metricName' | 'query' | 'metricTags' | 'isManualQuery' | 'dashboardPath'
>): GCOMetricInfo {
  return {
    dashboardName: isManualQuery ? MANUAL_QUERY_DASHBOARD : dashboardName,
    metricName,
    dashboardPath,
    query,
    metricTags,
    isManualQuery
  }
}

export function buildGCOMonitoringSourceInfo(
  params: ProjectPathProps,
  currentProduct: string
): GCOMonitoringSourceInfo {
  return {
    ...params,
    identifier: 'MyGoogleCloudOperationsSource',
    product: currentProduct,
    name: 'MyGoogleCloudOperationsSource',
    selectedDashboards: [],
    selectedMetrics: new Map<string, GCOMetricInfo>(),
    type: 'STACKDRIVER',
    mappedServicesAndEnvs: new Map<string, MapGCOLogsQueryToService>(),
    isEdit: false
  }
}

export function getManuallyCreatedQueries(selectedMetrics: GCOMonitoringSourceInfo['selectedMetrics']): string[] {
  if (!selectedMetrics?.size) return []
  const manualQueries: string[] = []
  for (const entry of selectedMetrics) {
    const [metricName, metricInfo] = entry
    if (metricName && metricInfo?.isManualQuery) {
      manualQueries.push(metricName)
    }
  }
  return manualQueries
}

export function formatJSON(val?: string | Record<string, unknown>): string | undefined {
  try {
    if (!val) return
    const res = typeof val === 'string' ? JSON.parse(val) : val
    return JSON.stringify(res, null, 2)
  } catch (e) {
    return
  }
}
