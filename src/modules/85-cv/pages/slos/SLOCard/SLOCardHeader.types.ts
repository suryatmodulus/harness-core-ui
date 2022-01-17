import type { SLODashboardWidget } from 'services/cv'

export interface SLOWidgetData extends SLODashboardWidget {
  environmentName?: string
  serviceName?: string
}
