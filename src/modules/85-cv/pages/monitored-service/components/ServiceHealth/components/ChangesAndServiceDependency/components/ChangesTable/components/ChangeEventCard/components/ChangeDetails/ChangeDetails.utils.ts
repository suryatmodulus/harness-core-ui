import { Color } from '@wings-software/uicore'
import type { ChangeEventDTO } from 'services/cv'
import { EXECUTION_STATUS } from './ChangeDetails.constant'

export const createDetailsTitle = (type?: string, category?: string) => {
  switch (category) {
    case category:
      return `${type} ${category} `
    default:
      return ''
  }
}

export const getOnClickOptions = (detailsItem: { name: string | ChangeEventDTO['type']; url?: string } | string) => {
  if (typeof detailsItem !== 'string' && detailsItem?.url) {
    return {
      onClick: () => window.open(detailsItem?.url, '_blank')
    }
  }
  return {}
}

export const statusToColorMapping = (status: string) => {
  switch (status) {
    case EXECUTION_STATUS.SUCCEEDED:
    case EXECUTION_STATUS.RUNNING:
    case EXECUTION_STATUS.TIMED_WAITING:
    case EXECUTION_STATUS.ASYNC_WAITING:
    case EXECUTION_STATUS.TASK_WAITING:
      return {
        color: Color.BLUE_500,
        backgroundColor: Color.BLUE_100
      }
    case EXECUTION_STATUS.PAUSING:
      return {
        color: Color.ORANGE_500,
        backgroundColor: Color.ORANGE_100
      }
    case EXECUTION_STATUS.INTERVENTION_WAITING:
    case EXECUTION_STATUS.APPROVAL_WAITING:
    case EXECUTION_STATUS.RESOURCE_WAITING:
      return {
        color: Color.ORANGE_200,
        backgroundColor: Color.ORANGE_100
      }
    case EXECUTION_STATUS.ABORTED:
    case EXECUTION_STATUS.ERRORED:
    case EXECUTION_STATUS.FAILED:
    case EXECUTION_STATUS.APPROVAL_REJECTED:
      return {
        color: Color.RED_500,
        backgroundColor: Color.RED_100
      }
    case EXECUTION_STATUS.NO_OP:
    case EXECUTION_STATUS.DISCONTINUING:
    case EXECUTION_STATUS.QUEUED:
    case EXECUTION_STATUS.SKIPPED:
    case EXECUTION_STATUS.PAUSED:
    case EXECUTION_STATUS.EXPIRED:
    case EXECUTION_STATUS.SUSPENDED:
    case EXECUTION_STATUS.IGNORE_FAILED:
    case EXECUTION_STATUS.UNRECOGNIZED:
      return {
        color: Color.BLACK,
        backgroundColor: Color.GREY_100
      }
    default:
      return {
        color: Color.GREY_500,
        backgroundColor: Color.GREY_50
      }
  }
}
