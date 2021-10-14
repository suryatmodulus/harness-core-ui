import type { StringsMap } from 'stringTypes'
import { getRiskLabelStringId } from '@cv/pages/monitored-service/CVMonitoredServiceListingPage.utils'
import { RiskValues, getRiskColorValue } from '@cv/utils/CommonUtils'

export const getServicesStates = (): { label: keyof StringsMap; identifier: string; color: string }[] => {
  return [
    {
      label: getRiskLabelStringId(RiskValues.UNHEALTHY),
      identifier: 'unhealthy',
      color: getRiskColorValue(RiskValues.UNHEALTHY)
    },
    {
      label: getRiskLabelStringId(RiskValues.NEED_ATTENTION),
      identifier: 'needsAttention',
      color: getRiskColorValue(RiskValues.NEED_ATTENTION)
    },
    {
      label: getRiskLabelStringId(RiskValues.OBSERVE),
      identifier: 'observe',
      color: getRiskColorValue(RiskValues.OBSERVE)
    },
    {
      label: getRiskLabelStringId(RiskValues.HEALTHY),
      identifier: 'healthy',
      color: getRiskColorValue(RiskValues.HEALTHY)
    },
    {
      label: 'na',
      identifier: 'na',
      color: getRiskColorValue(RiskValues.NO_DATA)
    }
  ]
}
