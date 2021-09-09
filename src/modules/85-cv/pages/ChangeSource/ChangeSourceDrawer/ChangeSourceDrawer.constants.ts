import { Connectors } from '@connectors/constants'
import type { CardSelectOption } from './ChangeSourceDrawer.types'

export const HARNESS_CD = 'HarnessCD'

export const ChangeSourceCategoryName = {
  DEPLOYMENT: 'Deployment',
  INFRASTRUCTURE: 'Infrastructure',
  ALERT: 'Alert'
}

export const ChangeSourceCategoryOptions = [
  { label: 'deploymentText', value: ChangeSourceCategoryName.DEPLOYMENT },
  { label: 'infrastructureText', value: ChangeSourceCategoryName.INFRASTRUCTURE },
  { label: 'cv.changeSource.alertText', value: ChangeSourceCategoryName.ALERT }
]

export const ChangeSourceConnectorOptions: CardSelectOption[] = [
  {
    label: 'cv.onboarding.changeSourceTypes.HarnessCDNextGen.name',
    value: HARNESS_CD,
    category: ChangeSourceCategoryName.DEPLOYMENT
  },
  { label: 'kubernetesText', value: Connectors.KUBERNETES_CLUSTER, category: ChangeSourceCategoryName.INFRASTRUCTURE },
  { label: 'common.pagerDuty', value: Connectors.PAGER_DUTY, category: ChangeSourceCategoryName.ALERT }
]

export const ChangeSourceFieldNames = {
  CATEGORY: 'category',
  TYPE: 'type'
}
