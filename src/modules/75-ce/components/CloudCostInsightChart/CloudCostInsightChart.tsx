import React, { forwardRef, useMemo } from 'react'
import type Highcharts from 'highcharts/highcharts'
import { isEqual, pick } from 'lodash-es'
import cx from 'classnames'
import { Container, Icon } from '@wings-software/uicore'
import type {
  PerspectiveTimeSeriesData,
  TimeSeriesDataPoints,
  QlceViewTimeGroupType,
  Maybe
} from 'services/ce/services'

import type { CCM_CHART_TYPES } from '@ce/constants'
import { CCM_PAGE_TYPE } from '@ce/types'
import Chart from './Chart'
import WorkloadDetailsChart from './WorkloadDetailsChart'
import { ResourceType, chartConfigMapping, chartOptionsMapping } from './ChartConfigs'
import { transformTimeSeriesData, ChartConfigType } from './chartUtils'
import css from './CloudCostInsightChart.module.scss'

interface CloudCostInsightChartProps {
  fetching: boolean
  errors?: any[] | null
  data: Maybe<PerspectiveTimeSeriesData>
  columnSequence: string[]
  chartType: CCM_CHART_TYPES
  aggregation: QlceViewTimeGroupType
  xAxisPointCount: number
  setFilterUsingChartClick?: (value: string) => void
  showLegends?: boolean
  pageType?: CCM_PAGE_TYPE
}

function getChartList({
  data,
  pageType,
  columnSequence
}: {
  data: Maybe<PerspectiveTimeSeriesData>
  pageType?: CCM_PAGE_TYPE
  columnSequence: string[]
}): ChartConfigType[][] {
  if (!data) {
    return []
  }
  if (pageType === CCM_PAGE_TYPE.Workload) {
    const cpuChart: any[] = []
    const memoryChart: any[] = []

    Object.keys(data).forEach(chartKey => {
      const key = chartKey as keyof PerspectiveTimeSeriesData
      const chartData = data[key] as Array<TimeSeriesDataPoints>
      if (!Array.isArray(chartData)) return
      const transformedSeries = transformTimeSeriesData(chartData)

      const { chartType, resource } = chartConfigMapping[chartKey] || {}

      const chartSeries = transformedSeries.map(chart => {
        const chartName = chart.name || 'DEFAULT'

        return Object.assign({}, chart, chartOptionsMapping[chartType][chartName], {
          visible: true,
          showInLegend: true,
          chartSeries: chartKey
        })
      })

      if (resource === ResourceType.CPU) {
        cpuChart.push(...chartSeries)
      }
      if (resource === ResourceType.MEMORY) {
        memoryChart.push(...chartSeries)
      }
    })

    const series: any[] = []

    cpuChart.length && series.push(cpuChart)
    memoryChart.length && series.push(memoryChart)
    return series
  }

  const defBillingData = (data?.stats as TimeSeriesDataPoints[]) || null
  const defBillingChartData = defBillingData && transformTimeSeriesData(defBillingData, columnSequence)
  return [defBillingChartData]
}

const CloudCostInsightChart = forwardRef((props: CloudCostInsightChartProps, ref: React.Ref<Highcharts.Chart>) => {
  const {
    data,
    chartType,
    aggregation,
    xAxisPointCount,
    setFilterUsingChartClick,
    showLegends,
    pageType,
    fetching,
    columnSequence
  } = props

  const chartListData = useMemo(
    () =>
      getChartList({
        data,
        pageType,
        columnSequence
      }),
    [data, columnSequence]
  )

  const setChartRef: (chart: Highcharts.Chart) => void = chart => {
    const chartRef = ref as { current: Highcharts.Chart }
    if (chartRef) {
      chartRef.current = chart
    }
  }

  if (fetching) {
    return (
      <Container className={cx(css.chartMainContainer, css.loadingContainer)}>
        <Icon name="spinner" size={28} color="blue500" />
      </Container>
    )
  }

  if (pageType === CCM_PAGE_TYPE.Workload) {
    return (
      <Container className={css.chartMainContainer}>
        <WorkloadDetailsChart
          data={chartListData}
          aggregation={aggregation}
          chartType={chartType}
          onLoad={setChartRef}
          xAxisPointCount={xAxisPointCount}
          showLegends={showLegends || false}
        />
      </Container>
    )
  }

  return (
    <div>
      <Chart
        data={chartListData}
        aggregation={aggregation}
        chartType={chartType}
        onLoad={setChartRef}
        xAxisPointCount={xAxisPointCount}
        setFilterUsingChartClick={setFilterUsingChartClick}
        showLegends={showLegends || false}
      />
    </div>
  )
})

CloudCostInsightChart.displayName = 'CloudCostInsightChart'

const propsToMonitor = ['data', 'fetching', 'errors', 'columnSequence', 'chartType']

export default React.memo(CloudCostInsightChart, (prevProps, nextProps) => {
  return isEqual(pick(prevProps, propsToMonitor), pick(nextProps, propsToMonitor))
})
