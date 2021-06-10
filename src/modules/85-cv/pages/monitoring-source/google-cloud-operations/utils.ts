import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  GCODSConfig,
  GCOMonitoringSourceInfo,
  buildGCOMonitoringSourceInfo,
  GCOProduct
} from './GoogleCloudOperationsMonitoringSourceUtils'
import type { GCOLogsDSConfig } from './MapQueriesToHarnessService/types'

export function transformGetResponseForStackDriver(
  gcoConfig: GCODSConfig,
  params: ProjectPathProps & { identifier: string }
): GCOMonitoringSourceInfo {
  const gcoInfo: GCOMonitoringSourceInfo = buildGCOMonitoringSourceInfo(params, GCOProduct.CLOUD_METRICS)
  if (!gcoConfig) {
    return gcoConfig
  }

  gcoInfo.accountId = gcoConfig.accountId
  gcoInfo.identifier = gcoConfig.identifier
  gcoInfo.name = gcoConfig.monitoringSourceName
  gcoInfo.type = 'STACKDRIVER'
  gcoInfo.orgIdentifier = gcoConfig.orgIdentifier
  gcoInfo.projectIdentifier = gcoConfig.projectIdentifier
  gcoInfo.isEdit = !!gcoConfig.identifier
  gcoInfo.connectorRef = {
    label: gcoConfig.connectorIdentifier as string,
    value: gcoConfig.connectorIdentifier as string
  }
  gcoInfo.product = GCOProduct.CLOUD_METRICS
  gcoInfo.selectedDashboards = []
  gcoInfo.selectedMetrics = new Map()

  for (const config of gcoConfig.metricConfigurations) {
    const { envIdentifier, serviceIdentifier, metricDefinition } = config
    // TODO: Remove this once backend fixes discripancy in key names manualQuery and isManualQuery
    const manualQuery = metricDefinition?.isManualQuery || (metricDefinition as any)?.manualQuery
    if (
      !envIdentifier ||
      !serviceIdentifier ||
      !metricDefinition ||
      !metricDefinition.dashboardName ||
      !(manualQuery ? true : metricDefinition.dashboardPath) ||
      !metricDefinition.metricName
    )
      continue

    const metricTags: any = {}
    for (const tag of metricDefinition.metricTags || []) {
      metricTags[tag] = ''
    }

    gcoInfo.selectedDashboards.push({ name: metricDefinition.dashboardName, path: metricDefinition.dashboardPath })
    gcoInfo.selectedMetrics.set(metricDefinition.metricName, {
      metricName: metricDefinition.metricName,
      metricTags,
      dashboardName: metricDefinition.dashboardName,
      dashboardPath: metricDefinition.dashboardPath,
      service: { label: serviceIdentifier, value: serviceIdentifier },
      environment: { label: envIdentifier, value: envIdentifier },
      isManualQuery: manualQuery,
      riskCategory: `${metricDefinition.riskProfile?.category}/${metricDefinition.riskProfile?.metricType}`,
      higherBaselineDeviation: metricDefinition.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER'),
      lowerBaselineDeviation: metricDefinition.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER'),
      query: JSON.stringify(metricDefinition.jsonMetricDefinition, null, 2)
    })
  }

  return gcoInfo
}

export function transformGetResponseForStackDriverLogs(
  gcoLogsConfig: GCOLogsDSConfig,
  params: ProjectPathProps & { identifier: string }
): GCOMonitoringSourceInfo {
  const gcoLogsInfo: GCOMonitoringSourceInfo = buildGCOMonitoringSourceInfo(params, GCOProduct.CLOUD_LOGS)
  if (!gcoLogsConfig) {
    return gcoLogsConfig
  }

  gcoLogsInfo.accountId = gcoLogsConfig.accountId
  gcoLogsInfo.identifier = gcoLogsConfig.identifier
  gcoLogsInfo.name = gcoLogsConfig.monitoringSourceName
  gcoLogsInfo.type = 'STACKDRIVER_LOG'
  gcoLogsInfo.orgIdentifier = gcoLogsConfig.orgIdentifier
  gcoLogsInfo.projectIdentifier = gcoLogsConfig.projectIdentifier
  gcoLogsInfo.connectorRef = {
    label: gcoLogsConfig.connectorIdentifier as string,
    value: gcoLogsConfig.connectorIdentifier as string
  }
  gcoLogsInfo.product = GCOProduct.CLOUD_LOGS
  gcoLogsInfo.isEdit = !!gcoLogsInfo.identifier

  for (const config of gcoLogsConfig.logConfigurations) {
    const { envIdentifier, serviceIdentifier, logDefinition } = config
    if (
      !envIdentifier ||
      !serviceIdentifier ||
      !logDefinition ||
      !logDefinition.name ||
      !logDefinition.query ||
      !logDefinition.serviceInstanceIdentifier ||
      !logDefinition.messageIdentifier
    ) {
      continue
    }

    gcoLogsInfo.mappedServicesAndEnvs.set(logDefinition.name, {
      metricName: logDefinition.name,
      serviceIdentifier: { label: serviceIdentifier, value: serviceIdentifier },
      envIdentifier: { label: envIdentifier, value: envIdentifier },
      serviceInstance: logDefinition.serviceInstanceIdentifier,
      messageIdentifier: logDefinition.messageIdentifier,
      query: logDefinition.query
    })
  }

  return gcoLogsInfo
}
