import { get } from 'lodash-es'

const RiskValues = {
  NO_DATA: 'NO_DATA',
  NO_ANALYSIS: 'NO_ANALYSIS',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
}

type Risk = 'NO_DATA' | 'NO_ANALYSIS' | 'LOW' | 'MEDIUM' | 'HIGH' | undefined

export function roundNumber(value: number, precision = 2) {
  if (Number.isInteger(precision) && precision >= 0) {
    const factor = 10 ** precision
    return Math.round(value * factor) / factor
  }
}

export function getErrorMessage(errorObj?: any): string | undefined {
  return get(errorObj, 'data.detailedMessage') || get(errorObj, 'data.message')
}

export const mapRisk = (risk?: Risk): Highcharts.PointOptionsObject => {
  switch (risk) {
    case RiskValues.LOW:
      return {
        color: '#F3FFE5',
        marker: {
          lineWidth: 1,
          lineColor: 'var(--green-450)',
          radius: 9
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
          radius: 7
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
      spacingRight: 100,
      spacingLeft: 100,
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
        return `<div><p>x: ${this.x && this.x.toFixed(5)}</p><br /><p>y: ${this.y && this.y.toFixed(5)}</p></div>`
      }
    }
  }
}
