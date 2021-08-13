import type { MonitoredServiceDTO } from 'services/cv'
import type { MonitoredServiceForm } from './MonitoredService.types'

export const getInitFormData = (data: MonitoredServiceDTO | undefined, isEdit: boolean): MonitoredServiceForm => {
  const {
    name = '',
    identifier = '',
    description = '',
    tags = {},
    serviceRef = '',
    environmentRef = '',
    sources
  } = data || {}

  return {
    isEdit,
    name,
    identifier,
    description,
    tags,
    serviceRef,
    environmentRef,
    sources
  }
}
