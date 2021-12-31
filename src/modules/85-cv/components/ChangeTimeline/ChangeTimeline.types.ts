import type { SelectOption } from '@wings-software/uicore'
import type { ChangeSourceTypes as ChangeSourceTypeRequest } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import type { ChangeSourceTypes } from './ChangeTimeline.constants'

export interface ChangeTimelineProps {
  timeFormat?: string
  serviceIdentifier: string | string[]
  environmentIdentifier: string | string[]
  changeCategories?: ('Deployment' | 'Infrastructure' | 'Alert')[]
  changeSourceTypes?: ChangeSourceTypeRequest[]
  startTime?: number
  endTime?: number
  onSliderMoved?: React.Dispatch<React.SetStateAction<ChangesInfoCardData[] | null>>
  selectedTimePeriod?: SelectOption
  hideTimeline?: boolean
}

export interface ChangesInfoCardData {
  key: ChangeSourceTypes
  count?: number
  message: string
}
