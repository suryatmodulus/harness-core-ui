import { Color, IconName } from '@wings-software/uicore'
import { ChangeSourceTypes } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'

export const getIconByChangeType = (type: string | undefined): { name: IconName; size: number; color?: string } => {
  switch (type) {
    case ChangeSourceTypes.HarnessCD:
    case ChangeSourceTypes.HarnessCDNextGen:
      return { name: 'cd-main', size: 24 }
    case ChangeSourceTypes.PagerDuty:
      return { name: 'service-pagerduty', size: 24 }
    case ChangeSourceTypes.K8sCluster:
      return { name: 'infrastructure', size: 32, color: Color.BLACK }
    default:
      return { name: 'circle', size: 0 }
  }
}
