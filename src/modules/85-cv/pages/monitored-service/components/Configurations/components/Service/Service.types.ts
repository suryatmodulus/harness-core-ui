import type { MonitoredServiceDTO } from 'services/cv'

export interface MonitoredServiceRef {
  name: string
  tags?: { [key: string]: any }
  identifier: string
  description?: string
}

export interface MonitoredServiceForm
  extends Omit<MonitoredServiceDTO, 'projectIdentifier' | 'orgIdentifier' | 'type'> {
  type: string
  isEdit: boolean
}
