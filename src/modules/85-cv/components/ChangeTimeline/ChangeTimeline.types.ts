import type { SelectOption } from '@wings-software/uicore'
import type { ChangeSourceTypes } from './ChangeTimeline.constants'

export interface ChangeTimelineProps {
  timeFormat?: string
  serviceIdentifier: any
  environmentIdentifier: any
  startTime?: number
  endTime?: number
  onSliderMoved?: React.Dispatch<React.SetStateAction<ChangesInfoCardData[] | null>>
  selectedTimePeriod?: SelectOption
}

export interface ChangesInfoCardData {
  key: ChangeSourceTypes
  count?: number
  message: string
}
