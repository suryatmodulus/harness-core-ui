export const CustomHealthSourceFieldNames = {
  METRIC_NAME: 'metricName',
  METRIC_IDENTIFIER: 'metricIdentifier',
  GROUP_NAME: 'groupName',

  SLI: 'sli',
  HEALTH_SCORE: 'healthScore',
  CONTINUOUS_VERIFICATION: 'continuousVerification',

  RISK_CATEGORY: 'riskCategory',
  HIGHER_BASELINE_DEVIATION: 'higherBaselineDeviation',
  LOWER_BASELINE_DEVIATION: 'lowerBaselineDeviation',

  BASE_URL: 'baseURL',
  PATH: 'pathURL',

  QUERY: 'query',
  QUERY_TYPE: 'queryType',
  REQUEST_METHOD: 'requestMethod',

  METRIC_VALUE: 'metricValue',
  TIMESTAMP_LOCATOR: 'timestamp',
  TIMESTAMP_FORMAT: 'timestampFormat',
  SERVICE_INSTANCE: 'serviceInstanceIdentifier'
}

export const defaultMetricName = 'CustomHealth Metric'
export const QueryType = {
  SERVICE_BASED: 'SERVICE_BASED',
  HOST_BASED: 'HOST_BASED'
}
