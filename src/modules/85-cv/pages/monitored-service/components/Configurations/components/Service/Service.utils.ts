import type { MonitoredServiceDTO } from 'services/cv'
import { MonitoredServiceType } from './components/MonitoredServiceOverview/MonitoredServiceOverview.constants'
import type { MonitoredServiceForm } from './Service.types'

export const getInitFormData = (
  data: MonitoredServiceDTO | undefined,
  defaultMonitoredService: MonitoredServiceDTO | undefined,
  isEdit: boolean
): MonitoredServiceForm => {
  const monitoredServiceData = isEdit ? data : defaultMonitoredService

  const {
    name = '',
    identifier = '',
    description = '',
    tags = {},
    serviceRef = '',
    environmentRef = '',
    sources,
    type
  } = monitoredServiceData || {}

  return {
    isEdit,
    name,
    identifier,
    description,
    tags,
    serviceRef,
    type: (type as string) || MonitoredServiceType.APPLICATION,
    environmentRef,
    sources
  }
}
