import React, { useMemo } from 'react'
import { Color, Container } from '@wings-software/uicore'
import { isNumber } from 'lodash-es'
import moment from 'moment'
import type { MetricData } from 'services/cv'
import { getRiskColorValue } from '@common/components/HeatMap/ColorUtils'
import TimeseriesRow, { SeriesConfig } from '@cv/components/TimeseriesRow/TimeseriesRow'
import css from './MetricAnalysisRow.module.scss'

interface MetricAnalysisRowProps {
  metricName: string
  categoryName?: string
  transactionName: string
  analysisData: MetricData[]
  startTime: number
  endTime: number
  displaySelectedTimeRange?: boolean
  setTimeSeriesRowRef?: (el: HTMLDivElement | null) => void
}

const ROW_HEIGHT = 60

function getTimeMaskWidthBasedOnTimeRange(startTime: number, endTime: number): number {
  switch (Math.round(moment.duration(moment(endTime).diff(startTime)).asMinutes())) {
    case 125:
      return 48
    case 135:
      return 73
    case 150:
      return 130
    case 330:
      return 405
    case 360:
      return 420
    case 1020:
      return 556
    default:
      return 545
  }
}

function transformAnalysisDataToChartSeries(analysisData: any[]): SeriesConfig[] {
  const highchartsLineData = []
  analysisData.sort((a, b) => a.timestamp - b.timestamp)
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

export default function MetricAnalysisRow(props: MetricAnalysisRowProps): JSX.Element {
  const {
    metricName,
    analysisData = [],
    transactionName,
    startTime,
    endTime,
    displaySelectedTimeRange,
    setTimeSeriesRowRef
  } = props || {}
  const timeseriesOptions = useMemo(() => transformAnalysisDataToChartSeries(analysisData), [analysisData])
  return (
    <Container className={css.main} height={ROW_HEIGHT}>
      {displaySelectedTimeRange && (
        <Container
          className={css.selectedTimeRange}
          height={ROW_HEIGHT}
          background={Color.BLUE_300}
          width={getTimeMaskWidthBasedOnTimeRange(startTime, endTime)}
        />
      )}
      <TimeseriesRow
        transactionName={transactionName}
        metricName={metricName}
        seriesData={timeseriesOptions}
        chartOptions={{
          chart: {
            height: ROW_HEIGHT
          }
        }}
        setChartDivRef={setTimeSeriesRowRef}
      />
    </Container>
  )
}
