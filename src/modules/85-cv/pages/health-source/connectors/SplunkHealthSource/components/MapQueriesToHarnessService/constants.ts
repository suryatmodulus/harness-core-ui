/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const MapSplunkToServiceFieldNames = {
  METRIC_NAME: 'metricName',
  QUERY: 'query',
  SERVICE_INSTANCE: 'serviceInstance',
  RECORD_COUNT: 'recordCount',
  IS_STALE_RECORD: 'isStaleRecord'
}

export const initialFormData = {
  metricName: 'SPLUNK Logs Query',
  query: '',
  recordCount: 0,
  serviceInstance: ''
}
