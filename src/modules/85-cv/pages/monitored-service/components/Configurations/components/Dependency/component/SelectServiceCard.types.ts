import type { MonitoredServiceListItemDTO } from 'services/cv'

export interface ServiceCardInterface {
  data: MonitoredServiceListItemDTO
  isChecked: boolean
  onChange: (item: any) => void
}
