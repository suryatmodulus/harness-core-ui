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
