import type { SelectOption } from '@wings-software/uicore'

export const MonitoredServiceType = {
  INFRASTRUCTURE: 'Infrastructure',
  APPLICATION: 'Application'
}

export const MonitoredServiceTypeOptions: SelectOption[] = [
  { label: MonitoredServiceType.APPLICATION, value: MonitoredServiceType.APPLICATION },
  { label: MonitoredServiceType.INFRASTRUCTURE, value: MonitoredServiceType.INFRASTRUCTURE }
]
