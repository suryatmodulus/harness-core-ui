import type { ColumnData } from './ColumnChart.types'
import { LOADING_COLUMN_HEIGHTS } from './ColumnChart.constants'

export function calculatePositionForTimestamp({
  endOfTimestamps,
  startTime,
  startOfTimestamps,
  containerWidth
}: {
  endOfTimestamps: number
  startTime: number
  startOfTimestamps: number
  containerWidth: number
}): number {
  return (1 - (endOfTimestamps - startTime) / (endOfTimestamps - startOfTimestamps)) * containerWidth
}

export function getColumnPositions(containerWidth: number, timestamps?: ColumnData[]): number[] {
  if (!timestamps?.length) {
    return []
  }
  const startOfTimestamps = timestamps[0]?.timeRange?.startTime
  const endOfTimestamps = timestamps[timestamps?.length - 1]?.timeRange?.endTime
  if (!startOfTimestamps || !endOfTimestamps) {
    return []
  }
  const barLeftOffset: number[] = []
  for (const timestamp of timestamps) {
    const { startTime } = timestamp?.timeRange || {}
    if (!startTime) continue
    const position = calculatePositionForTimestamp({ endOfTimestamps, startTime, startOfTimestamps, containerWidth })
    barLeftOffset.push(position)
  }
  return barLeftOffset
}

export function getLoadingColumnPositions(containerWidth: number): number[] {
  return LOADING_COLUMN_HEIGHTS.map((_, index) => (containerWidth / LOADING_COLUMN_HEIGHTS.length) * index)
}
