import React, { useEffect, useState } from 'react'
import type { OptionsStackingValue } from 'highcharts'
import moment from 'moment'
import { Icon } from '@wings-software/uicore'
import { QlceViewTimeGroupType } from 'services/ce/services'
import type { ChartConfigType } from './chartUtils'
import CEChart from '../CEChart/CEChart'
import ChartLegend from './ChartLegend'

export const DAYS_FOR_TICK_INTERVAL = 10
export const ONE_MONTH = 24 * 3600 * 1000 * 30

interface GetChartProps {
  chart: ChartConfigType[]
  idx: number
  onLoad: (chart: Highcharts.Chart) => void
  chartType: string
  aggregation: QlceViewTimeGroupType
  xAxisPointCount: number
  setFilterUsingChartClick?: (value: string) => void
  showLegends: boolean
}

const GetChart: React.FC<GetChartProps> = ({
  chart,
  idx,
  onLoad,
  chartType,
  aggregation,
  xAxisPointCount,
  setFilterUsingChartClick,
  showLegends
}) => {
  const [chartObj, setChartObj] = useState<Highcharts.Chart | null>(null)

  const [forceCounter, setForceCounter] = useState(0)

  useEffect(() => {
    // When the chart data changes the legend component is not getting updated due to no deps on data
    // This setForceCounter ensures that it is taken care of when chart data is changing.
    // This fixes the use case of sorting chart based column sequence of the grid.
    setForceCounter(forceCounter + 1)
  }, [chart])

  const xAxisOptions: Highcharts.XAxisOptions = {
    type: 'datetime',
    ordinal: true,
    min: null,
    tickInterval:
      aggregation === QlceViewTimeGroupType.Day && xAxisPointCount < DAYS_FOR_TICK_INTERVAL
        ? 24 * 3600 * 1000
        : undefined,
    // Add Tick Interval,
    labels: {
      formatter: function () {
        switch (aggregation) {
          case QlceViewTimeGroupType.Month:
            return moment(this.value).utc().format('MMM')

          case QlceViewTimeGroupType.Hour:
            return moment(this.value).utc().format('MMM DD HH:00')

          default:
            return moment(this.value).utc().format('MMM DD')
        }
      }
    },
    minPadding: 0.05,
    maxPadding: 0.05
  }

  const stacking: OptionsStackingValue = 'normal'

  const plotOptions = {
    series: {
      connectNulls: true,
      animation: {
        duration: 500
      },
      events: {
        click: function (event: any) {
          const name = event.point.series.userOptions.name as string
          setFilterUsingChartClick && setFilterUsingChartClick(name)
        }
      },
      stacking
    },
    area: {
      lineWidth: 1,
      marker: {
        enabled: false
      }
    },
    column: {
      borderColor: undefined
    },
    legend: {
      enabled: true,
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical'
    }
  }

  if (aggregation === QlceViewTimeGroupType.Month) {
    xAxisOptions.tickInterval = ONE_MONTH
  }

  return (
    <article key={idx}>
      <CEChart
        options={{
          series: chart as any,
          chart: {
            zoomType: 'x',
            height: 300,
            type: chartType,
            events: {
              load() {
                setChartObj(this)
                onLoad(this)
              }
            }
          },
          plotOptions,
          yAxis: {
            endOnTick: true,
            min: 0,
            max: null,
            tickAmount: 3,
            title: {
              text: ''
            },
            labels: {
              formatter: function () {
                return `$${this.value}`
              }
            }
          },
          xAxis: xAxisOptions
        }}
      />
      {chartObj && showLegends ? (
        <ChartLegend chartRefObj={chartObj as unknown as Highcharts.Chart} />
      ) : showLegends ? (
        <Icon name="spinner" />
      ) : null}
    </article>
  )
}

interface CCMChartProps {
  data: ChartConfigType[][]
  onLoad: (chart: Highcharts.Chart) => void
  chartType: string
  aggregation: QlceViewTimeGroupType
  xAxisPointCount: number
  setFilterUsingChartClick?: (value: string) => void
  showLegends: boolean
}

const Chart: React.FC<CCMChartProps> = ({
  data,
  onLoad,
  chartType,
  aggregation,
  xAxisPointCount,
  setFilterUsingChartClick,
  showLegends
}) => {
  return (
    <>
      {data.map((chart, idx: number) => {
        return chart ? (
          <GetChart
            key={idx}
            chartType={chartType}
            aggregation={aggregation}
            xAxisPointCount={xAxisPointCount}
            chart={chart}
            idx={idx}
            setFilterUsingChartClick={setFilterUsingChartClick}
            onLoad={onLoad}
            showLegends={showLegends}
          />
        ) : null
      })}
    </>
  )
}

export default Chart
