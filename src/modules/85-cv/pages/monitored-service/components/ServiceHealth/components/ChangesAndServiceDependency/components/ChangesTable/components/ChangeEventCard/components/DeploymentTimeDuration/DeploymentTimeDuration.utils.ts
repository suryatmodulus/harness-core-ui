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
