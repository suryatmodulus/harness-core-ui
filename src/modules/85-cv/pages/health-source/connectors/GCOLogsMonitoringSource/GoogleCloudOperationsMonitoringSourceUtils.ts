import type { SelectOption } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { MapGCOLogsQueryToService } from './components/MapQueriesToHarnessService/types'
import { HealthSourceTypes } from '../../types'

export const GCOProduct = {
  CLOUD_METRICS: 'Cloud Metrics',
  CLOUD_LOGS: 'Cloud Logs'
}
export interface GCOMonitoringSourceInfo {
  name?: string
  identifier?: string
  connectorRef?: SelectOption
  isEdit?: boolean
  product: string
  type: string
  mappedServicesAndEnvs: Map<string, MapGCOLogsQueryToService>
}

export function buildGCOMonitoringSourceInfo(
  params: ProjectPathProps,
  data: any
): GCOMonitoringSourceInfo & ProjectPathProps {
  return {
    ...params,
    name: data?.healthSourceName,
    identifier: data?.healthSourceidentifier,
    connectorRef: data?.connectorRef,
    isEdit: data?.isEdit,
    product: data?.product,
    type: HealthSourceTypes.StackdriverLog,
    mappedServicesAndEnvs: getMappedServicesAndEnvs(data)
  }
}

const getMappedServicesAndEnvs = (data: any): Map<string, MapGCOLogsQueryToService> => {
  const currentHealthSource = data?.healthSourceList?.find((el: any) => el?.identifier === data?.healthSourceidentifier)
  const mappedQueries = currentHealthSource?.spec?.queries
  if (currentHealthSource && !isEmpty(mappedQueries)) {
    const mappedServicesAndEnvs = new Map<string, MapGCOLogsQueryToService>()
    for (const query of mappedQueries) {
      mappedServicesAndEnvs.set(query?.name, {
        metricName: query?.name,
        serviceInstance: query?.serviceInstanceIdentifier,
        messageIdentifier: query?.messageIdentifier,
        query: query?.query
      })
    }
    return mappedServicesAndEnvs
  } else {
    return new Map<string, MapGCOLogsQueryToService>()
  }
}
