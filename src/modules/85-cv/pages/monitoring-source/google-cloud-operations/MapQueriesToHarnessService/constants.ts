export const MapGCPLogsToServiceFieldNames = {
  METRIC_NAME: 'metricName',
  SERVICE: 'serviceIdentifier',
  ENVIRONMENT: 'envIdentifier',
  QUERY: 'query',
  SERVICE_INSTANCE: 'serviceInstance',
  MESSAGE_IDENTIFIER: 'messageIdentifier',
  RECORD_COUNT: 'recordCount'
}

export const GCOLogsTabIndex = {
  SELECT_CONNECTOR: 0,
  MAP_QUERIES: 1,
  REVIEW_MAPPINGS: 2
}

export const initialFormData = {
  metricName: 'GCO Logs Query',
  serviceIdentifier: null,
  envIdentifier: null,
  query: '',
  recordCount: 0,
  serviceInstance: '',
  messageIdentifier: ''
}
