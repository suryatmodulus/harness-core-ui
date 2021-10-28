import type { IconName } from '@wings-software/uicore'
import type { StringsMap } from 'stringTypes'
import { RiskValues, getRiskColorValue, getRiskLabelStringId } from '@cv/utils/CommonUtils'

export const getServicesStates = (): { labelId: keyof StringsMap; color: string }[] => {
  return [
    {
      labelId: getRiskLabelStringId(RiskValues.UNHEALTHY),
      color: getRiskColorValue(RiskValues.UNHEALTHY)
    },
    {
      labelId: getRiskLabelStringId(RiskValues.NEED_ATTENTION),
      color: getRiskColorValue(RiskValues.NEED_ATTENTION)
    },
    {
      labelId: getRiskLabelStringId(RiskValues.OBSERVE),
      color: getRiskColorValue(RiskValues.OBSERVE)
    },
    {
      labelId: getRiskLabelStringId(RiskValues.HEALTHY),
      color: getRiskColorValue(RiskValues.HEALTHY)
    },
    {
      labelId: 'na',
      color: getRiskColorValue(RiskValues.NO_DATA)
    }
  ]
}

export const getServicesTypes = (): { labelId: keyof StringsMap; icon: IconName; size: number }[] => {
  return [
    {
      labelId: 'cv.changeSource.HarnessCDCurrentGen.applicationId',
      icon: 'dependency-default-icon',
      size: 10
    },
    {
      labelId: 'infrastructureText',
      icon: 'infrastructure',
      size: 14
    }
  ]
}
