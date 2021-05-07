import React from 'react'
import { useMemo } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts, { PlotOptions } from 'highcharts'
import { clone, merge } from 'lodash-es'
import markerUrl from './event-marker.svg'
import markerUrlHover from './event-marker-hover.svg'

const chartDefaultOptions: Highcharts.Options = {
  chart: { type: 'column' },
  legend: { enabled: false },
  credits: { enabled: false },
  xAxis: {
    // Consider to remove crosshair - It does not look pretty on top of data
    // crosshair: {
    //   width: 2,
    //   dashStyle: 'ShortDash',
    //   color: '#0092E4',
    //   zIndex: 10
    // }
  },
  yAxis: {
    title: undefined,
    gridLineWidth: 0,
    lineWidth: 1
  },
  tooltip: {
    // shared: true,
    useHTML: true,
    // Custom tooltip will be implemented with https://harness.atlassian.net/browse/FFM-802
    formatter: function formatter(): string {
      const th = this as any // eslint-disable-line
      console.log('THIS', th)
      return 'Click to show events' // th.points[0]?.point?.series?.userOptions?.tooltips?.[th.x]
    },
    hideDelay: 1500,
    style: {
      pointerEvents: 'auto'
    }
  },
  plotOptions: {
    series: { states: { inactive: { opacity: 1 } } },
    column: {
      stacking: 'normal',
      dataLabels: { enabled: false },
      borderColor: undefined
    },
    scatter: {
      cursor: 'pointer',
      point: {
        events: {
          click: function () {
            this.update({
              marker: {
                width: 14,
                height: 14,
                symbol: `url(${markerUrlHover})`
              }
            })
            console.log('Category: ' + this.category + ', value: ' + this.y)
          }
        }
      },
      stacking: undefined,
      marker: {
        width: 14,
        height: 14,
        symbol: `url(${markerUrl})`
      }
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
