export enum ClusterTypeEnum {
  KNOWN = 'KNOWN',
  UNKNOWN = 'UNKNOWN',
  UNEXPECTED = 'UNEXPECTED'
}

export enum DatasourceTypeEnum {
  APP_DYNAMICS = 'APP_DYNAMICS',
  SPLUNK = 'SPLUNK',
  STACKDRIVER = 'STACKDRIVER',
  STACKDRIVER_LOG = 'STACKDRIVER_LOG',
  KUBERNETES = 'KUBERNETES',
  NEW_RELIC = 'NEW_RELIC',
  PROMETHEUS = 'PROMETHEUS'
}

export interface MetricsAndLogsProps {
  serviceIdentifier: string
  environmentIdentifier: string
  startTime: number
  endTime: number
}
