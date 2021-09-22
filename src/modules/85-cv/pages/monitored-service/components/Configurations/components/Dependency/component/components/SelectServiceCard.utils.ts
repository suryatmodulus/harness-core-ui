import type { ChangeSourceDTO, MonitoredServiceDTO } from 'services/cv'

export function getConnectorRefFromChangeSourceService(
  monitoredService: MonitoredServiceDTO,
  changeSourceType: ChangeSourceDTO['type']
): string | undefined {
  for (const changeSource of monitoredService?.sources?.changeSources || []) {
    if (changeSource.type === changeSourceType) {
      return changeSource.spec.connectorRef
    }
  }
}
