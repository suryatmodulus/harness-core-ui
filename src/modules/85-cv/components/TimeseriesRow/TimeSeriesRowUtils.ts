/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isNumber } from 'lodash-es'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import type { TimeSeriesMetricDataDTO } from 'services/cv'
import type { SeriesConfig } from './TimeseriesRow'

export function transformAnalysisDataToChartSeries(
  analysisData: TimeSeriesMetricDataDTO['metricDataList'] = []
): SeriesConfig[] {
  const highchartsLineData = []
  analysisData.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
  let currentRiskColor: string | null = getRiskColorValue(analysisData?.[0].risk)
  const zones: Highcharts.SeriesZonesOptionsObject[] = [{ value: undefined, color: currentRiskColor }]

  for (const dataPoint of analysisData) {
    const { timestamp: x, risk, value: y } = dataPoint || {}
    const riskColor = getRiskColorValue(risk)
    if (isNumber(x) && isNumber(y) && risk) {
      highchartsLineData.push({
        x,
        y
      })
      if (riskColor !== currentRiskColor) {
        zones[zones.length - 1].value = x
        zones.push({ value: undefined, color: riskColor })
        currentRiskColor = riskColor
      }
    } else {
      currentRiskColor = null
      highchartsLineData.push({ x, y: null, color: 'transparent' })
    }
  }

  return [{ series: [{ type: 'line', data: highchartsLineData, zones, zoneAxis: 'x', clip: false, lineWidth: 1 }] }]
}
