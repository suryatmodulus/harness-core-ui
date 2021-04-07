import React, { useMemo } from 'react'
import Highcharts, { SeriesColumnOptions } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { merge } from 'lodash-es'

type DataType = Omit<SeriesColumnOptions, 'type'>[]

export interface StackedColumnChartProps {
  data: DataType
  options?: Highcharts.Options
}

const getDefaultOptions = (data: DataType): Highcharts.Options => ({
  chart: {
    type: 'column'
  },
  title: {
    text: ''
  },
  credits: {
    enabled: false
  },
  xAxis: {
    visible: false,
    categories: []
  },
  yAxis: {
    title: {
      text: null
    },
    gridLineWidth: 0
  },
  tooltip: {
    enabled: false
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
      pointWidth: 5,
      stacking: 'normal',
      animation: false
    }
  },
  legend: {
    padding: 0
  },
  series: data as SeriesColumnOptions[]
})

const getParsedOptions = (defaultOptions: Highcharts.Options, options: Highcharts.Options): Highcharts.Options =>
  merge(defaultOptions, options)

export const StackedColumnChart: React.FC<StackedColumnChartProps> = props => {
  const { data, options = {} } = props
  const defaultOptions = useMemo(() => getDefaultOptions(data), [data])
  const parsedOptions = useMemo(() => getParsedOptions(defaultOptions, options), [defaultOptions, options])
  return <HighchartsReact highcharts={Highcharts} options={parsedOptions} />
}
