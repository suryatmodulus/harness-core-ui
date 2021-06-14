import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { DSConfig } from 'services/cv'
import type { GCOMonitoringSourceInfo } from '../GoogleCloudOperationsMonitoringSourceUtils'

export interface MapQueriesToHarnessServiceProps {
  onNext: (data: GCOMonitoringSourceInfo) => void
  onPrevious: () => void
  data: GCOMonitoringSourceInfo
}

export type MapGCOLogsQueryToService = {
  metricName: string
  serviceIdentifier?: SelectOption | null
  envIdentifier?: SelectOption | null
  serviceInstance?: string
  messageIdentifier?: string
  query: string
}

export interface GCOLogsQueryDefinition {
  serviceIdentifier: string
  envIdentifier: string
  logDefinition: {
    name: string
    query: string
    serviceInstanceIdentifier?: string
    messageIdentifier?: string
  }
}

export interface GCOLogsDSConfig extends DSConfig {
  logConfigurations: GCOLogsQueryDefinition[]
  type: 'STACKDRIVER_LOG'
}
