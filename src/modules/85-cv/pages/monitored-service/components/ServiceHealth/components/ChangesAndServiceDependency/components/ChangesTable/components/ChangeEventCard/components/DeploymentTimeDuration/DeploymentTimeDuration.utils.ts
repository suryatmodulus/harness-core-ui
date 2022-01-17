/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
export const durationAsString = (start: number, end: number): string => {
  const duration = moment.duration(moment(end).diff(moment(start)))

  //Get Days
  const days = Math.floor(duration.asDays())
  const daysFormatted = days ? `${days}d ` : ''

  //Get Hours
  const hours = duration.hours()
  const hoursFormatted = hours ? `${hours}h ` : ''

  //Get Minutes
  const minutes = duration.minutes()
  const minutesFormatted = minutes ? `${minutes}m ` : ''

  //Get Seconds
  const seconds = duration.seconds()
  const secondsFormatted = seconds ? `${seconds}s ` : ''

  return [daysFormatted, hoursFormatted, minutesFormatted, secondsFormatted].join('')
}
