import type { ChangeSourceTypes } from './ChangeTimeline.constants'

export interface ChangeTimelineProps {
  timeFormat?: string
  serviceIdentifier: string
  environmentIdentifier: string
  startTime?: number
  endTime?: number
  onSliderMoved?: React.Dispatch<React.SetStateAction<ChangesInfoCardData[] | null>>
  selectedTimePeriod?: string
}

export interface ChangesInfoCardData {
  key: ChangeSourceTypes
  count: number
}
