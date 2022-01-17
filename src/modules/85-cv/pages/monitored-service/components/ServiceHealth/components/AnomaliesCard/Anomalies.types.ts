/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ChangesInfoCardData } from '@cv/components/ChangeTimeline/ChangeTimeline.types'
import type { RiskData, TimeRangeParams } from 'services/cv'

export interface IsAnomaliesDataAvailable {
  isTimeSeriesAnomaliesAvailable: boolean
  isLogsAnomaliesAvailable: boolean
  isTotalAnomaliesAvailable: boolean
  isLowestHealthScoreAvailable: boolean
}

export interface AnomaliesCardProps {
  timeRange?: TimeRangeParams
  lowestHealthScoreBarForTimeRange?: RiskData
  timeFormat: string
  serviceIdentifier?: string
  environmentIdentifier?: string
  monitoredServiceIdentifier?: string
  changeTimelineSummary?: ChangesInfoCardData[]
}
