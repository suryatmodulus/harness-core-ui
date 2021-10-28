import { RiskValues, getRiskColorValue, getSecondaryRiskColorValue } from '@cv/utils/CommonUtils'
import type { IconDetails } from './DependencyGraph.types'

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
export const infrastructureIcon = 'infrastructure'

export const serviceIconDetails: IconDetails = { x: '34%', y: '34%', width: 20, height: 20 }
export const infrastructureIconDetails: IconDetails = { x: '26%', y: '27%', width: 30, height: 30 }
