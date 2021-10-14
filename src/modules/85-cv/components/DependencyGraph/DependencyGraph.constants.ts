import { RiskValues, getRiskColorValue, getSecondaryRiskColorValue } from '@cv/utils/CommonUtils'

export const statusColors = [
  {
    status: RiskValues.UNHEALTHY,
    primary: getRiskColorValue(RiskValues.UNHEALTHY, false),
    secondary: getSecondaryRiskColorValue(RiskValues.UNHEALTHY, false)
  },
  {
    status: RiskValues.OBSERVE,
    primary: getRiskColorValue(RiskValues.OBSERVE, false),
    secondary: getSecondaryRiskColorValue(RiskValues.OBSERVE, false)
  },
  {
    status: RiskValues.NEED_ATTENTION,
    primary: getRiskColorValue(RiskValues.NEED_ATTENTION, false),
    secondary: getSecondaryRiskColorValue(RiskValues.NEED_ATTENTION, false)
  },
  {
    status: RiskValues.HEALTHY,
    primary: getRiskColorValue(RiskValues.HEALTHY, false),
    secondary: getSecondaryRiskColorValue(RiskValues.HEALTHY, false)
  },
  {
    status: RiskValues.NO_ANALYSIS,
    primary: getRiskColorValue(RiskValues.NO_ANALYSIS, false),
    secondary: getSecondaryRiskColorValue(RiskValues.NO_ANALYSIS, false)
  },
  {
    status: RiskValues.NO_DATA,
    primary: getRiskColorValue(RiskValues.NO_DATA, false),
    secondary: getSecondaryRiskColorValue(RiskValues.NO_DATA, false)
  }
]

export const wrappedArrowLength = 5
export const serviceIcon = 'dependency-default-icon'
