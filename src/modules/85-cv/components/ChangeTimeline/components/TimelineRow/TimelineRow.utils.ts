/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { TimelineDataPoint, TimelineData } from './TimelineRow.types'

export function getDataWithPositions(
  containerWidth: number,
  startOfTimestamps?: number,
  endOfTimestamps?: number,
  data?: TimelineData[]
): TimelineDataPoint[] {
  if (!data?.length || !startOfTimestamps || !endOfTimestamps) {
    return []
  }

  const timelineDataPoints: TimelineDataPoint[] = []
  for (const datum of data) {
    const { startTime, endTime, icon, tooltip } = datum || {}
    if (startTime && endTime && icon) {
      timelineDataPoints.push({
        endTime,
        startTime,
        icon,
        tooltip,
        leftOffset: containerWidth * (1 - (endOfTimestamps - startTime) / (endOfTimestamps - startOfTimestamps))
      })
    }
  }

  return timelineDataPoints
}
