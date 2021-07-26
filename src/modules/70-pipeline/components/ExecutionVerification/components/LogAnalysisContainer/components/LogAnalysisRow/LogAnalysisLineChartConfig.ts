import type { SeriesLineOptions } from 'highcharts'
import moment from 'moment'

export default function getLogAnalysisLineChartOptions(series: SeriesLineOptions[]): Highcharts.Options {
  return {
    chart: {
      renderTo: 'chart',
      margin: [0, 10, 0, 10],
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'var(--font-family)'
      }
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    xAxis: {
      labels: { enabled: false },
      lineWidth: 0,
      tickLength: 0,
      gridLineWidth: 0,
      title: {
        text: ''
      }
    },
    yAxis: {
      labels: { enabled: false },
      lineWidth: 0,
      tickLength: 0,
      gridLineWidth: 0,
      title: {
        text: ''
      }
    },
    plotOptions: {
      series: {
        stickyTracking: false
      },
      line: {
        marker: {
          enabled: false
        }
      }
    },
    tooltip: {
      outside: true,
      useHTML: true,
      formatter: function () {
        return `${moment(this.x).format('MM/DD/YYYY hh:mm')}<br/><p style="text-align:center;margin-bottom:0">${
          this.y
        }</p>`
      }
    },
    subtitle: undefined,
    series
  }
}
