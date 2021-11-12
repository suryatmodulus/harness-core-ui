import type { IconName } from '@wings-software/uicore'
import type { FilterTypes } from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.types'

export interface FilterCardItem {
  type: FilterTypes
  title: string
  icon: IconName
  iconSize?: number
  count?: number
}

export interface FilterCardProps {
  data: Array<FilterCardItem>
  cardClassName?: string
  selected?: FilterCardItem
  onChange: (selected: FilterCardItem) => void
}
