import moment from 'moment'
import React from 'react'
import type Highcharts from 'highcharts'
import { renderToStaticMarkup } from 'react-dom/server'
import css from './TimelineRow.module.scss'

const dateFormat = 'Do MMM hh:mm A'

export const EventTimelineHighChartsConfig: Highcharts.Options = {
  chart: {
    type: 'scatter',
    renderTo: 'chart',
    height: 20,
    backgroundColor: 'transparent'
  },
  credits: {
    enabled: false
  },
  title: {
    text: ''
  },
  legend: {
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
  tooltip: {
    outside: true,
    useHTML: true,
    padding: 0,
    shadow: false,
    borderColor: 'transparent',
    formatter: function (this: any) {
      if (this.series.name) {
        const { marker } = this.point
        return renderToStaticMarkup(
          <div className={css.tooltipContainer}>
            <div className={css.colorSidePanel} style={{ backgroundColor: marker.custom.color }}></div>
            <div className={css.tooltipLabel}>{marker.custom.toolTipLabel} </div>
            <div>{moment(new Date(marker.custom.startTime)).format(dateFormat)}</div>
          </div>
        )
      } else {
        return ''
      }
    }
  },
  plotOptions: {
    scatter: {
      events: {},
      marker: {
        radius: 5
      }
    }
  },
  series: []
}
