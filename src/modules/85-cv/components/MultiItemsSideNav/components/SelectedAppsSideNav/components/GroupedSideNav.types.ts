import type { SelectOption } from '@wings-software/uicore'

export interface GroupedMetric {
  groupName: SelectOption | undefined
  metricName: string | undefined
}

export interface GroupedCreatedMetrics {
  [Key: string]: GroupedMetric[]
}
