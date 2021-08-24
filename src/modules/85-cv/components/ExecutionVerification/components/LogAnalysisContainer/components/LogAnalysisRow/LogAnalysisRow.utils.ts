import type { LogData } from 'services/cv'

export const getEventTypeFromClusterType = (tag: LogData['tag']): string => {
  switch (tag) {
    case 'KNOWN':
      return 'Known'
    case 'UNKNOWN':
      return 'Unknown'
    case 'UNEXPECTED':
      return 'Unexpected'
    default:
      return ''
  }
}
