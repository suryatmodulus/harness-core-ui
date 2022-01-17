/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const NewRelicHealthSourceFieldNames = {
  NEWRELIC_APPLICATION: 'newRelicApplication',
  METRIC_DATA: 'metricData',

  METRIC_NAME: 'metricName',
  METRIC_IDENTIFIER: 'metricIdentifier',
  GROUP_NAME: 'groupName',

  NEWRELIC_QUERY: 'query',

  METRIC_VALUE: 'metricValue',
  TIMESTAMP_LOCATOR: 'timestamp',
  TIMESTAMP_FORMAT: 'timestampFormat',

  CONTINUOUS_VERIFICATION: 'continuousVerification',
  HEALTH_SCORE: 'healthScore',
  SLI: 'sli',

  RISK_CATEGORY: 'riskCategory',
  HIGHER_BASELINE_DEVIATION: 'higherBaselineDeviation',
  LOWER_BASELINE_DEVIATION: 'lowerBaselineDeviation'
}

export const newRelicDefaultMetricName = 'New Relic Metric'
