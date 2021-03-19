import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { DSConfig } from 'services/cv'

export const NewRelicProductNames = {
  APM: 'apm'
}

export function buildDefaultNewRelicMonitoringSource({
  orgIdentifier,
  projectIdentifier,
  accountId
}: ProjectPathProps): DSConfig {
  return {
    monitoringSourceName: `MyNewRelicSource${orgIdentifier}-${projectIdentifier}`,
    accountId,
    orgIdentifier,
    projectIdentifier,
    productName: NewRelicProductNames.APM,
    identifier: `MyNewRelicSource${orgIdentifier}-${projectIdentifier}`,
    type: 'APP_DYNAMICS'
  }
}
