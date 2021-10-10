import type { SelectOption } from '@wings-software/uicore'

export const MonitoredServiceType = {
  INFRASTRUCTURE: 'Infrastructure',
  APPLICATION: 'Application',
  APP: 'APP',
  INFRA: 'INFRA'
}

export const MonitoredServiceTypeOptions: SelectOption[] = [
  { label: MonitoredServiceType.APPLICATION, value: MonitoredServiceType.APPLICATION },
  { label: MonitoredServiceType.INFRASTRUCTURE, value: MonitoredServiceType.INFRASTRUCTURE }
]
