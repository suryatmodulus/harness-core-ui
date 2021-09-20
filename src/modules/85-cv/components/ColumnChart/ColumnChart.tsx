import React, { useMemo } from 'react'
import HighchartsReact from 'highcharts-react-official'
import { merge } from 'lodash-es'
import Highcharts, { SeriesColumnOptions } from 'highcharts'
import moment from 'moment'
import { RiskValues } from '@cv/utils/CommonUtils'
import type { ColumnChartProps, DataType } from './ColumnChart.types'
import { getTimeFormat } from '../ChangeTimeline/components/TimestampChart/TimestampChart.utils'

const getDefaultOptions = (data: DataType, format?: string): Highcharts.Options => {
  const timeFormat = getTimeFormat(format)
  return {
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
        animation: true,
        // minPointLength: 3,
        events: {
          legendItemClick: function () {
            return false
          }
        }
      }
    },
    tooltip: {
      formatter: function () {
        let healthScore
        if ((this.point as any)?.riskStatus === RiskValues.NO_DATA) {
          healthScore = `<p>No Data</p><br/>`
        } else if ((this.point as any)?.healthScore <= 8) {
          healthScore = `<p>Health Score: ${(this.point as any)?.healthScore}</p><br/>`
        } else {
          healthScore = `<p>Health Score: ${this.y}</p><br/>`
        }
        return ` ${healthScore}
        <p>Start time: ${moment(new Date((this.point as any)?.timeRange?.startTime)).format(timeFormat)}, &nbsp;</p>
        <p>End time: ${moment(new Date((this.point as any)?.timeRange?.endTime)).format(timeFormat)}</p>
        `
      }
    },
    series: data as SeriesColumnOptions[]
  }
}

const getParsedOptions = (defaultOptions: Highcharts.Options, options: Highcharts.Options): Highcharts.Options =>
  merge(defaultOptions, options)

export default function ColumnChart(props: ColumnChartProps): JSX.Element {
  const { data, options = {}, timeFormat } = props
  const defaultOptions = useMemo(() => getDefaultOptions(data, timeFormat), [data])
  const parsedOptions = useMemo(() => getParsedOptions(defaultOptions, options), [defaultOptions, options])
  return <HighchartsReact highcharts={Highcharts} options={parsedOptions} />
}
