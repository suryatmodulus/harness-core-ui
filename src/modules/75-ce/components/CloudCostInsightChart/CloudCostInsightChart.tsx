import React, { forwardRef, useMemo } from 'react'
import type Highcharts from 'highcharts/highcharts'
import { isEqual, pick } from 'lodash-es'
import type { PerspectiveTimeSeriesData, TimeSeriesDataPoints, QlceViewTimeGroupType } from 'services/ce/services'

import type { CCM_CHART_TYPES } from '@ce/constants'
import Chart from './Chart'
import { transformTimeSeriesData, ChartConfigType } from './chartUtils'

interface CloudCostInsightChartProps {
  fetching: boolean
  errors?: any[] | null
  data: PerspectiveTimeSeriesData
  columnSequence: string[]
  chartType: CCM_CHART_TYPES
  aggregation: QlceViewTimeGroupType
  xAxisPointCount: number
  setFilterUsingChartClick: (value: string) => void
  showLegends?: boolean
}

function getChartList({ data }: { data: PerspectiveTimeSeriesData }): ChartConfigType[][] {
  const defBillingData = (data?.stats as TimeSeriesDataPoints[]) || null
  const defBillingChartData = defBillingData && transformTimeSeriesData(defBillingData, [])
  return [defBillingChartData]
}

const CloudCostInsightChart = forwardRef((props: CloudCostInsightChartProps, ref: React.Ref<Highcharts.Chart>) => {
  const { data, chartType, aggregation, xAxisPointCount, setFilterUsingChartClick, showLegends } = props

  const chartListData = useMemo(
    () =>
      getChartList({
        data
      }),
    [data]
  )

  const setChartRef: (chart: Highcharts.Chart) => void = chart => {
    const chartRef = ref as { current: Highcharts.Chart }
    if (chartRef) {
      chartRef.current = chart
    }
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
