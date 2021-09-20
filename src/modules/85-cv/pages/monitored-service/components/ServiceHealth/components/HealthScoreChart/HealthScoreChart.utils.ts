import { highRiskColor, lowRiskColor, mediumRiskColor, noAnalysisColor } from '@common/components/HeatMap/ColorUtils'
import { RiskValues } from '@cv/utils/CommonUtils'
import type { RiskData } from 'services/cv'
import type { SeriesDataPoint } from './HealthScoreChart.types'

export const mapRiskStatusToColor = (riskStatus: string): string => {
  switch (riskStatus) {
    case RiskValues.LOW:
      return lowRiskColor
    case RiskValues.MEDIUM:
      return mediumRiskColor
    case RiskValues.HIGH:
      return highRiskColor
    default:
      return noAnalysisColor
  }
}

export const getSeriesData = (healthScoreData: RiskData[]): SeriesDataPoint[] => {
  return healthScoreData.map(el => {
    let healthScoreDataPoint = {
      y: el.healthScore,
      ...(el?.timeRangeParams?.startTime && { x: el.timeRangeParams.startTime * 1000 }),
      color: mapRiskStatusToColor(el.riskStatus as string),
      timeRange: {
        ...(el?.timeRangeParams?.startTime && { startTime: el.timeRangeParams.startTime * 1000 }),
        ...(el?.timeRangeParams?.endTime && { endTime: el.timeRangeParams.endTime * 1000 })
      },
      riskStatus: el.riskStatus,
      healthScore: el.healthScore
    }

    if (el.healthScore === 0) {
      healthScoreDataPoint = { ...healthScoreDataPoint, y: 5 }
    } else if (el.riskStatus === RiskValues.NO_DATA || isHealthScoreLessThanEqualTo(el, 8)) {
      healthScoreDataPoint = { ...healthScoreDataPoint, y: 8 }
    }
    return healthScoreDataPoint
  })
}

function isHealthScoreLessThanEqualTo(el: RiskData, num: number): boolean {
  return !!(el.healthScore && el.healthScore <= num)
}
