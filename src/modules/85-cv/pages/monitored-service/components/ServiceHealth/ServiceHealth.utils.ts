import type { SelectOption } from '@wings-software/uicore'
import type { UseStringsReturn } from 'framework/strings'
import { DAYS, HOURS, NUMBER_OF_DATA_POINTS, TimePeriodEnum } from './ServiceHealth.constants'

export const getTimePeriods = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    { value: TimePeriodEnum.FOUR_HOURS, label: getString('cv.monitoredServices.serviceHealth.last4Hrs') },
    { value: TimePeriodEnum.TWENTY_FOUR_HOURS, label: getString('cv.monitoredServices.serviceHealth.last24Hrs') },
    { value: TimePeriodEnum.THREE_DAYS, label: getString('cv.monitoredServices.serviceHealth.last3Days') },
    { value: TimePeriodEnum.SEVEN_DAYS, label: getString('cv.monitoredServices.serviceHealth.last7Days') },
    { value: TimePeriodEnum.THIRTY_DAYS, label: getString('cd.serviceDashboard.month') }
  ]
}

export const getTimestampsForPeriod = (selectedTimePeriod: string): number[] => {
  const timestamps = []
  const intervalInHrs = getTimeInHrs(selectedTimePeriod) / NUMBER_OF_DATA_POINTS
  let endTime = Date.now()
  timestamps.push(endTime)

  for (let i = 1; i < NUMBER_OF_DATA_POINTS; i++) {
    endTime -= intervalInHrs * 60 * 60000
    timestamps.push(endTime)
  }

  const actualTimestamps = timestamps.reverse()
  return actualTimestamps
}

export const getTimeInHrs = (selectedTimePeriod: string): number => {
  let timeInHrs = 24
  switch (selectedTimePeriod) {
    case TimePeriodEnum.FOUR_HOURS:
      timeInHrs = 4
      break
    case TimePeriodEnum.TWENTY_FOUR_HOURS:
      timeInHrs = 24
      break
    case TimePeriodEnum.THREE_DAYS:
      timeInHrs = 24 * 3
      break
    case TimePeriodEnum.SEVEN_DAYS:
      timeInHrs = 24 * 7
      break
    case TimePeriodEnum.THIRTY_DAYS:
      timeInHrs = 24 * 30
      break
    default:
      timeInHrs = 24
  }
  return timeInHrs
}

export const getTimeFormat = (selectedTimePeriod: string): string => {
  let timeFormat = HOURS
  switch (selectedTimePeriod) {
    case TimePeriodEnum.FOUR_HOURS:
      timeFormat = HOURS
      break
    case TimePeriodEnum.TWENTY_FOUR_HOURS:
      timeFormat = HOURS
      break
    case TimePeriodEnum.THREE_DAYS:
      timeFormat = DAYS
      break
    case TimePeriodEnum.SEVEN_DAYS:
      timeFormat = DAYS
      break
    case TimePeriodEnum.THIRTY_DAYS:
      timeFormat = DAYS
      break
    default:
      timeFormat = HOURS
  }
  return timeFormat
}

export function calculateStartAndEndTimes(
  startXPercentage: number,
  endXPercentage: number,
  timestamps?: number[]
): [number, number] | undefined {
  if (!timestamps?.length) return
  const startTime = Math.floor(startXPercentage * (timestamps[timestamps.length - 1] - timestamps[0]) + timestamps[0])
  const endTime = Math.floor(endXPercentage * (timestamps[timestamps.length - 1] - timestamps[0]) + timestamps[0])
  return [startTime, endTime]
}
