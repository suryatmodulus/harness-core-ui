import type Highcharts from 'highcharts'
import type { LogAnalysisClusterChartDTO } from 'services/cv'
import { RiskValues, getRiskColorValue, getSecondaryRiskColorValue } from '@cv/utils/CommonUtils'

export const mapRisk = (risk: LogAnalysisClusterChartDTO['risk']): Highcharts.PointOptionsObject => {
  switch (risk) {
    case RiskValues.HEALTHY:
      return {
        color: getSecondaryRiskColorValue(RiskValues.HEALTHY),
        marker: {
          lineWidth: 1,
          lineColor: getRiskColorValue(RiskValues.HEALTHY),
          radius: 8
        }
      }
    case RiskValues.NEED_ATTENTION:
      return {
        color: getSecondaryRiskColorValue(RiskValues.NEED_ATTENTION),
        marker: {
          lineWidth: 1,
          lineColor: getRiskColorValue(RiskValues.NEED_ATTENTION),
          radius: 8
        }
      }
    case RiskValues.UNHEALTHY:
      return {
        color: getSecondaryRiskColorValue(RiskValues.UNHEALTHY),
        marker: {
          lineWidth: 1,
          lineColor: getRiskColorValue(RiskValues.UNHEALTHY),
          radius: 8
        }
      }
    case RiskValues.OBSERVE:
      return {
        color: getSecondaryRiskColorValue(RiskValues.OBSERVE),
        marker: {
          lineWidth: 1,
          lineColor: getRiskColorValue(RiskValues.OBSERVE),
          radius: 8
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
