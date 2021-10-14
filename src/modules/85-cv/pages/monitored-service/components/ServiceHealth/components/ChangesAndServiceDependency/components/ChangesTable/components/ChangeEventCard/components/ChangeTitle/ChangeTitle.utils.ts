import type { IconName } from '@wings-software/uicore'
import { ChangeSourceTypes } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'

export const getIconByChangeType = (type: string | undefined): IconName => {
  switch (type) {
    case ChangeSourceTypes.HarnessCD:
    case ChangeSourceTypes.HarnessCDNextGen:
      return 'cd-main'
    case ChangeSourceTypes.PagerDuty:
      return 'service-pagerduty'
    case ChangeSourceTypes.K8sCluster:
      return 'infrastructure'
    default:
      return '' as IconName
  }
}
