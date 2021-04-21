import { isNumber } from 'lodash-es'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { Color } from '@wings-software/uicore'
import type { UseStringsReturn } from 'framework/strings/String'
import type { ActivityDashboardDTO } from 'services/cv'
import type { Activity } from './ActivityTimeline/ActivityTrack/ActivityTrackUtils'

export type AggregatedActivities = Map<string, { iconProps: IconProps; totalCount: number }>
export function aggregateActivityByType(
  getString: UseStringsReturn['getString'],
  activities?: Activity[]
): AggregatedActivities {
  const aggregatedEvents = new Map<string, { iconProps: IconProps; totalCount: number }>([
    [getString('inProgress'), { iconProps: { name: 'deployment-inprogress-new', size: 12 }, totalCount: 0 }],
    [getString('passed'), { iconProps: { name: 'deployment-success-new', size: 12 }, totalCount: 0 }],
    [getString('common.failed'), { iconProps: { name: 'deployment-failed-new', size: 12 }, totalCount: 0 }]
  ])

  if (!activities?.length) return aggregatedEvents

  for (const activity of activities) {
    if (!activity?.activityStatus) continue
    let event
    switch (activity.activityStatus as ActivityDashboardDTO['verificationStatus']) {
      case 'NOT_STARTED':
      case 'IN_PROGRESS':
        event = aggregatedEvents.get(getString('inProgress'))
        if (event && isNumber(event.totalCount)) event.totalCount++
        break
      case 'ERROR':
      case 'VERIFICATION_FAILED':
        event = aggregatedEvents.get(getString('common.failed'))
        if (event && isNumber(event.totalCount)) event.totalCount++
        break
      case 'VERIFICATION_PASSED':
        event = aggregatedEvents.get(getString('passed'))
        if (event && isNumber(event.totalCount)) event.totalCount++
        break
      default:
        break
    }
  }

  return aggregatedEvents
}

export function activityStatusToColor(status: ActivityDashboardDTO['verificationStatus']): string {
  switch (status) {
    case 'VERIFICATION_FAILED':
    case 'ERROR':
      return Color.RED_500
    case 'IN_PROGRESS':
      return Color.BLUE_500
    case 'VERIFICATION_PASSED':
      return Color.GREEN_500
    case 'NOT_STARTED':
    default:
      return Color.GREY_350
  }
}
