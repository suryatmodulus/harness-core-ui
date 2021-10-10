import type { ColumnData } from './ColumnChart.types'

export function getTimestamps(parentWidth: number, timestamps?: ColumnData[]): number[] {
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
    const position = (1 - (endOfTimestamps - startTime) / (endOfTimestamps - startOfTimestamps)) * parentWidth
    barLeftOffset.push(position)
  }
  return barLeftOffset
}
