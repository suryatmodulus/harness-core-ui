import React, { useMemo } from 'react'
import HighchartsReact from 'highcharts-react-official'
import { merge } from 'lodash-es'
import Highcharts, { SeriesColumnOptions } from 'highcharts'
import type { ColumnChartProps, DataType } from './ColumnChart.types'

const getDefaultOptions = (data: DataType): Highcharts.Options => ({
  chart: {
    type: 'column',
    height: 150,
    backgroundColor: 'transparent'
  },
  title: {
    text: ''
  },
  credits: {
    enabled: false
  },
  xAxis: {
    title: {
      text: null
    },
    labels: {
      enabled: false
    },
    tickLength: 0,
    lineWidth: 2,
    lineColor: 'var(--grey-100)',
    gridLineWidth: 0
  },
  yAxis: {
    visible: false
  },
  plotOptions: {
    column: {
      pointPadding: 0,
      borderWidth: 3,
      borderRadius: 4,
      pointWidth: 12,
      animation: false,
      events: {
        legendItemClick: function () {
          return false
        }
      }
    }
  },
  tooltip: {
    formatter: function () {
      return `<p>Health Score: ${this.y}</p>`
    }
  },
  series: data as SeriesColumnOptions[]
})

const getParsedOptions = (defaultOptions: Highcharts.Options, options: Highcharts.Options): Highcharts.Options =>
  merge(defaultOptions, options)

export default function ColumnChart(props: ColumnChartProps): JSX.Element {
  const { data, options = {} } = props
  const defaultOptions = useMemo(() => getDefaultOptions(data), [data])
  const parsedOptions = useMemo(() => getParsedOptions(defaultOptions, options), [defaultOptions, options])
  return <HighchartsReact highcharts={Highcharts} options={parsedOptions} />
}
