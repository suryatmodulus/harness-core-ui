import type { Dispatch, SetStateAction } from 'react'
import type { ChangeSourceDTO, MonitoredServiceResponse } from 'services/cv'
import type { MonitoredServiceRef } from '@cv/pages/monitored-service/components/Configurations/components/Service/Service.types'
import type { RowData } from '../HealthSourceDrawer/HealthSourceDrawerContent.types'

export interface HealthSourceTableInterface {
  value: Array<RowData>
  breadCrumbRoute?: {
    routeTitle: string
  }
  monitoredServiceRef: MonitoredServiceRef
  serviceRef: string
  environmentRef: string
  onSuccess: (value: MonitoredServiceResponse) => void
  isEdit?: boolean
  shouldRenderAtVerifyStep?: boolean
  isRunTimeInput?: boolean
  onCloseDrawer?: Dispatch<SetStateAction<boolean>>
  validMonitoredSource?: boolean
  validateMonitoredSource?: () => void
  changeSources?: ChangeSourceDTO[]
}
