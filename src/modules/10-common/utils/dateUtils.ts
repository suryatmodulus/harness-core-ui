import moment from 'moment'

export const formatDatetoLocale = (date: number | string): string => {
  return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`
}

export const getReadableDateTime = (timestamp?: number, formatString = 'MMM DD, YYYY'): string => {
  if (!timestamp) {
    return ''
  }
  return moment(timestamp).format(formatString)
}
