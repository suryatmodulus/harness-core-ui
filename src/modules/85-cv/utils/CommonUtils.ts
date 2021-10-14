import { get } from 'lodash-es'
import { Color, Utils } from '@wings-software/uicore'

export enum RiskValues {
  NO_DATA = 'NO_DATA',
  NO_ANALYSIS = 'NO_ANALYSIS',
  HEALTHY = 'HEALTHY',
  OBSERVE = 'OBSERVE',
  NEED_ATTENTION = 'NEED_ATTENTION',
  UNHEALTHY = 'UNHEALTHY'
}

export function getRiskColorValue(riskStatus?: keyof typeof RiskValues, realCSSColor = true): string {
  switch (riskStatus) {
    case RiskValues.NO_DATA:
      return realCSSColor ? Utils.getRealCSSColor(Color.GREY_400) : Color.GREY_400
    case RiskValues.HEALTHY:
      return realCSSColor ? Utils.getRealCSSColor(Color.GREEN_500) : Color.GREEN_500
    case RiskValues.OBSERVE:
      return realCSSColor ? Utils.getRealCSSColor(Color.YELLOW_800) : Color.YELLOW_800
    case RiskValues.NEED_ATTENTION:
      return realCSSColor ? Utils.getRealCSSColor(Color.ORANGE_600) : Color.ORANGE_600
    case RiskValues.UNHEALTHY:
      return realCSSColor ? Utils.getRealCSSColor(Color.RED_600) : Color.RED_600
    default:
      return realCSSColor ? Utils.getRealCSSColor(Color.GREY_200) : Color.GREY_200
  }
}

export function getSecondaryRiskColorValue(riskStatus?: keyof typeof RiskValues, realCSSColor = true): string {
  switch (riskStatus) {
    case RiskValues.HEALTHY:
      return realCSSColor ? Utils.getRealCSSColor(Color.GREEN_50) : Color.GREEN_50
    case RiskValues.OBSERVE:
      return realCSSColor ? Utils.getRealCSSColor(Color.YELLOW_50) : Color.YELLOW_50
    case RiskValues.NEED_ATTENTION:
      return realCSSColor ? Utils.getRealCSSColor(Color.ORANGE_50) : Color.ORANGE_50
    case RiskValues.UNHEALTHY:
      return realCSSColor ? Utils.getRealCSSColor(Color.RED_50) : Color.RED_50
    default:
      return realCSSColor ? Utils.getRealCSSColor(Color.GREY_50) : Color.GREY_50
  }
}

export function roundNumber(value: number, precision = 2) {
  if (Number.isInteger(precision) && precision >= 0) {
    const factor = 10 ** precision
    return Math.round(value * factor) / factor
  }
}

export function getErrorMessage(errorObj?: any): string | undefined {
  return get(errorObj, 'data.detailedMessage') || get(errorObj, 'data.message') || get(errorObj, 'message')
}
