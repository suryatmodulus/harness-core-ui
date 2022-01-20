/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
  controlData: Highcharts.SeriesLineOptions['data'][],
  testData: HostTestData[]
): Highcharts.SeriesLineOptions[][] {
  const highchartsOptions: Highcharts.SeriesLineOptions[][] = []

  for (let index = 0; index < controlData.length; index++) {
    const testDataLineColor = getRiskColorValue(testData[index].risk)
    highchartsOptions.push([
      {
        type: 'line',
        data: controlData[index] || [],
        color: 'var(--grey-200)',
        name: testData[index].name,
        connectNulls: true,
        marker: {
          enabled: true,
          lineWidth: 1,
          symbol: 'circle',
          fillColor: 'var(--white)',
          lineColor: 'var(--grey-200)'
        }
      },
      {
        type: 'line',
        data: testData[index].points || [],
        color: testDataLineColor,
        name: testData[index].name,
        connectNulls: true,
        marker: {
          enabled: true,
          lineWidth: 1,
          symbol: 'circle',
          fillColor: 'var(--white)',
          lineColor: testDataLineColor
        }
      }
    ])
  }

  return highchartsOptions
}
