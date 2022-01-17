/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DatadogProduct } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.utils'

export const DatadogMetricsMockHealthSource = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'mockHealthSourceName',
      identifier: 'test',
      type: 'DatadogMetrics',
      spec: {
        connectorRef: 'datadog',
        feature: 'Datadog Cloud Metrics',
        metricDefinitions: [
          {
            metricName: 'mockMetricName',
            dashboardId: 'd4d-ahq-k8k',
            dashboardName: 'Test dashboard name'
          }
        ]
      }
    }
  ],
  monitoringSourceName: 'todolist',
  monitoredServiceIdentifier: 'todolist',
  healthSourceName: 'mockHealthSourceName',
  healthSourceIdentifier: 'datadog',
  sourceType: 'DatadogLog',
  connectorRef: 'datadogConnector',
  product: { label: DatadogProduct.CLOUD_METRICS, value: DatadogProduct.CLOUD_METRICS }
}
