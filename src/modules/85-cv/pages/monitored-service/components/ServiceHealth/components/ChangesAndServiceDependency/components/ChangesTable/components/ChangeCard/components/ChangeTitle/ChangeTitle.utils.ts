import type { IconName } from '@wings-software/uicore'
import { ChangeSourceTypes } from '@cv/components/ChangeTimeline/ChangeTimeline.constants'

export const getIconByChangeType = (type: string | undefined): IconName => {
  switch (type) {
    case ChangeSourceTypes.Deployments:
      return 'cd-main'
    case ChangeSourceTypes.Incidents:
      return 'service-pagerduty'
    case ChangeSourceTypes.Infrastructure:
      return 'infrastructure'
    default:
      return '' as IconName
  }
}
