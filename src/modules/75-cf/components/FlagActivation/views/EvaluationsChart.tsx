import React from 'react'
import { useMemo } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts, { PlotOptions } from 'highcharts'
import { clone, merge } from 'lodash-es'

const chartDefaultOptions: Highcharts.Options = {
  chart: {
    type: 'areaspline'
  },
  legend: {
    layout: 'vertical',
    align: 'left',
    verticalAlign: 'top',
    x: 80,
    y: 40,
    floating: true,
    borderWidth: 1
  },
  xAxis: {
    crosshair: {
      width: 2,
      dashStyle: 'ShortDash',
      color: '#0092E4'
    },
    tickmarkPlacement: 'on',
    startOnTick: true,
    plotLines: [
      {
        value: 0,
        width: 1,
        color: '#D9DAE5',
        zIndex: 10
      }
    ]
  },
  yAxis: {
    title: undefined,
    gridLineColor: 'transparent'
  },
  tooltip: {
    shared: true,
    useHTML: true
    // Custom tooltip will be implemented with https://harness.atlassian.net/browse/FFM-802
    // formatter: function formatter(): string {
    //   const th = this as any // eslint-disable-line
    //   return th.points[0]?.point?.series?.userOptions?.tooltips?.[th.x]
    // },
    // hideDelay: 1500,
    // style: {
    //   pointerEvents: 'auto'
    // }
  },
  credits: {
    enabled: false
  },
  plotOptions: {
    series: {
      pointPlacement: 'on'
    },
    areaspline: {
      fillOpacity: 0.8,
      lineColor: 'transparent'
    }
  }
}

export const EvaluationsChart: React.FC<{ series: PlotOptions; categories: string[]; title: string }> = ({
  series,
  categories,
  title
}) => {
  const parsedOptions = useMemo(
    () => merge(clone(chartDefaultOptions), { title: { text: title }, series, xAxis: { categories } }),
    [series, categories, title]
  )
  return <HighchartsReact highcharts={Highcharts} options={parsedOptions} />
}
