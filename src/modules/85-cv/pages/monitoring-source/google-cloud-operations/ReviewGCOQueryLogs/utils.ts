import type { GCOMonitoringSourceInfo } from '../GoogleCloudOperationsMonitoringSourceUtils'
import type { GCOLogsDSConfig, MapGCOLogsQueryToService } from '../MapQueriesToHarnessService/types'

export function transformGCOLogsToDSConfig(setupSource: GCOMonitoringSourceInfo): GCOLogsDSConfig {
  const dsConfig: GCOLogsDSConfig = {
    connectorIdentifier: setupSource.connectorRef?.value as string,
    type: 'STACKDRIVER_LOG',
    accountId: setupSource.accountId,
    projectIdentifier: setupSource.projectIdentifier,
    orgIdentifier: setupSource.orgIdentifier,
    identifier: setupSource.identifier,
    monitoringSourceName: setupSource.name,
    logConfigurations: []
  }

  for (const entry of setupSource.mappedServicesAndEnvs.entries()) {
    const {
      metricName,
      query,
      serviceIdentifier,
      envIdentifier,
      serviceInstance,
      messageIdentifier
    }: MapGCOLogsQueryToService = entry[1]

    dsConfig.logConfigurations.push({
      envIdentifier: envIdentifier?.value as string,
      serviceIdentifier: serviceIdentifier?.value as string,
      logDefinition: {
        name: metricName,
        query,
        serviceInstanceIdentifier: serviceInstance,
        messageIdentifier: messageIdentifier
      }
    })
  }

  return dsConfig
}
