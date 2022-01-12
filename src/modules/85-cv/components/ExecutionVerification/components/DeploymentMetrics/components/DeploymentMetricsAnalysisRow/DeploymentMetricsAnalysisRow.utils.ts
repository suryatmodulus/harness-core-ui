import type { IconName } from '@wings-software/uicore'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import type { HostTestData } from './DeploymentMetricsAnalysisRow.constants'

export function healthSourceTypeToLogo(healthSourceType: any): IconName {
  switch (healthSourceType) {
    case 'APP_DYNAMICS':
      return 'service-appdynamics'
    case 'NEW_RELIC':
      return 'service-newrelic'
    case 'PROMETHEUS':
      return 'service-prometheus'
    case 'SPLUNK':
      return 'service-splunk'
    case 'STACKDRIVER':
    case 'STACKDRIVER_LOG':
      return 'service-stackdriver'
    case 'DATADOG_METRICS':
    case 'DATADOG_LOG':
      return 'service-datadog'
    default:
      return 'circle'
  }
}

export function transformControlAndTestDataToHighChartsSeries(
  controlData: Highcharts.SeriesAreasplineOptions['data'][],
  testData: HostTestData[]
): Highcharts.SeriesAreasplineOptions[][] {
  const highchartsOptions: Highcharts.SeriesAreasplineOptions[][] = []

  for (let index = 0; index < controlData.length; index++) {
    const testDataLineColor = getRiskColorValue(testData[index].risk)

    highchartsOptions.push([
      {
        type: 'areaspline',
        data: controlData[index] || [],
        color: 'var(--grey-200)',
        name: testData[index].name,
        marker: {
          enabled: controlData[index]?.length === 1,
          lineWidth: 1,
          fillColor: 'var(--white)',
          lineColor: 'var(--grey-200)'
        },
        lineColor: 'var(--grey-200)',
        lineWidth: 2
      },
      {
        type: 'areaspline',
        data: testData[index].points || [],
        color: testDataLineColor,
        name: testData[index].name,
        marker: {
          enabled: testData[index]?.points?.length === 1,
          lineWidth: 1,
          fillColor: 'var(--white)',
          lineColor: testDataLineColor
        },
        lineColor: testDataLineColor,
        lineWidth: 2
      }
    ])
  }

  return highchartsOptions
}
