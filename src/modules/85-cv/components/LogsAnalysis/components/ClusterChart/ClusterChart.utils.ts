import type Highcharts from 'highcharts'
import { RiskValues } from './ClusterChart.constants'
import type { Risk } from './ClusterChart.types'

export const mapRisk = (risk?: Risk): Highcharts.PointOptionsObject => {
  switch (risk) {
    case RiskValues.LOW:
      return {
        color: 'var(--green-50)',
        marker: {
          lineWidth: 1,
          lineColor: 'var(--green-450)',
          radius: 8
        }
      }
    case RiskValues.MEDIUM:
      return {
        color: 'var(--yellow-500)',
        marker: {
          radius: 7
        }
      }
    case RiskValues.HIGH:
      return {
        color: 'var(--red-500)',
        marker: {
          radius: 7,
          lineColor: 'var(--black-100)'
        }
      }
    default:
      return {}
  }
}

export const chartOptions = (series: Highcharts.SeriesScatterOptions[]) => {
  return {
    chart: {
      renderTo: 'chart',
      height: 120
    },
    credits: {
      enabled: false
    },
    title: {
      text: undefined
    },
    yAxis: {
      lineWidth: 0,
      tickLength: 0,
      gridLineWidth: 0,
      labels: { enabled: false },
      title: {
        enabled: false
      }
    },
    xAxis: {
      lineWidth: 0,
      tickLength: 0,
      gridLineWidth: 0,
      labels: { enabled: false },
      title: {
        enabled: false
      }
    },
    legend: {
      enabled: false
    },
    series,
    tooltip: {
      formatter: function (this: any): any {
        return `<p>${this?.point?.message}</p>`
      },
      style: {
        textOverflow: 'ellipsis'
      }
    }
  }
}
