import { Utils, Color } from '@wings-software/uicore'
import { RiskValues, getRiskColorValue, getSecondaryRiskColorValue } from './CommonUtils'

describe('Test for getRiskColorValue', () => {
  test('getRiskColorValue should return correct realCSSColors', () => {
    expect(getRiskColorValue(RiskValues.NO_DATA)).toEqual(Utils.getRealCSSColor(Color.GREY_400))
    expect(getRiskColorValue(RiskValues.HEALTHY)).toEqual(Utils.getRealCSSColor(Color.GREEN_500))
    expect(getRiskColorValue(RiskValues.OBSERVE)).toEqual(Utils.getRealCSSColor(Color.YELLOW_800))
    expect(getRiskColorValue(RiskValues.NEED_ATTENTION)).toEqual(Utils.getRealCSSColor(Color.ORANGE_600))
    expect(getRiskColorValue(RiskValues.UNHEALTHY)).toEqual(Utils.getRealCSSColor(Color.RED_600))
    expect(getRiskColorValue(RiskValues.NO_ANALYSIS)).toEqual(Utils.getRealCSSColor(Color.GREY_200))
    expect(getRiskColorValue()).toEqual(Utils.getRealCSSColor(Color.GREY_200))
  }),
    test('getRiskColorValue should return correct non realCSSColors', () => {
      expect(getRiskColorValue(RiskValues.NO_DATA, false)).toEqual(Color.GREY_400)
      expect(getRiskColorValue(RiskValues.HEALTHY, false)).toEqual(Color.GREEN_500)
      expect(getRiskColorValue(RiskValues.OBSERVE, false)).toEqual(Color.YELLOW_800)
      expect(getRiskColorValue(RiskValues.NEED_ATTENTION, false)).toEqual(Color.ORANGE_600)
      expect(getRiskColorValue(RiskValues.UNHEALTHY, false)).toEqual(Color.RED_600)
      expect(getRiskColorValue(RiskValues.NO_ANALYSIS, false)).toEqual(Color.GREY_200)
      expect(getRiskColorValue()).toEqual(Utils.getRealCSSColor(Color.GREY_200))
    })
})

describe('Test for getSecondaryRiskColorValue', () => {
  test('getSecondaryRiskColorValue should return correct realCSSColors', () => {
    expect(getSecondaryRiskColorValue(RiskValues.NO_DATA)).toEqual(Utils.getRealCSSColor(Color.GREY_50))
    expect(getSecondaryRiskColorValue(RiskValues.HEALTHY)).toEqual(Utils.getRealCSSColor(Color.GREEN_50))
    expect(getSecondaryRiskColorValue(RiskValues.OBSERVE)).toEqual(Utils.getRealCSSColor(Color.YELLOW_50))
    expect(getSecondaryRiskColorValue(RiskValues.NEED_ATTENTION)).toEqual(Utils.getRealCSSColor(Color.ORANGE_50))
    expect(getSecondaryRiskColorValue(RiskValues.UNHEALTHY)).toEqual(Utils.getRealCSSColor(Color.RED_50))
    expect(getSecondaryRiskColorValue(RiskValues.NO_ANALYSIS)).toEqual(Utils.getRealCSSColor(Color.GREY_50))
    expect(getSecondaryRiskColorValue()).toEqual(Utils.getRealCSSColor(Color.GREY_50))
  }),
    test('getSecondaryRiskColorValue should return correct non realCSSColors', () => {
      expect(getSecondaryRiskColorValue(RiskValues.NO_DATA, false)).toEqual(Color.GREY_50)
      expect(getSecondaryRiskColorValue(RiskValues.HEALTHY, false)).toEqual(Color.GREEN_50)
      expect(getSecondaryRiskColorValue(RiskValues.OBSERVE, false)).toEqual(Color.YELLOW_50)
      expect(getSecondaryRiskColorValue(RiskValues.NEED_ATTENTION, false)).toEqual(Color.ORANGE_50)
      expect(getSecondaryRiskColorValue(RiskValues.UNHEALTHY, false)).toEqual(Color.RED_50)
      expect(getSecondaryRiskColorValue(RiskValues.NO_ANALYSIS, false)).toEqual(Color.GREY_50)
      expect(getSecondaryRiskColorValue()).toEqual(Utils.getRealCSSColor(Color.GREY_50))
    })
})
