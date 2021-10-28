import type { MonitoredServiceDTO } from 'services/cv'

export interface TitleProps {
  loading?: boolean
  monitoredService?: MonitoredServiceDTO
}

export interface ToolbarProps extends TitleProps {
  lastModifiedAt?: number
}
