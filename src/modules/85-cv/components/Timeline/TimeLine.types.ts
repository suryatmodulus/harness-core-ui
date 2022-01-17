/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ChangeSourceTypes } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'

export interface TimeRangeParams {
  startTime?: number
  endTime?: number
}

export interface TimelineProps {
  serviceIdentifier: string | string[]
  environmentIdentifier: string | string[]
  changeCategories?: ('Deployment' | 'Infrastructure' | 'Alert')[]
  changeSourceTypes?: ChangeSourceTypes[]
  isOptionalHealthSource?: boolean
  selectedTimePeriod: SelectOption
  monitoredServiceIdentifier: string | undefined
  timestamps: number[]
  setTimestamps: React.Dispatch<React.SetStateAction<number[]>>
  timeRange?: TimeRangeParams
  setTimeRange: React.Dispatch<React.SetStateAction<TimeRangeParams | undefined>>
  showTimelineSlider?: boolean
  setShowTimelineSlider: React.Dispatch<React.SetStateAction<boolean>>
  resetFilter?: Date
}
