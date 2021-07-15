import type { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { HealthSourceSpec } from 'services/cv'
import type { GCOMonitoringSourceInfo } from '../../GoogleCloudOperationsMonitoringSourceUtils'

export interface MapQueriesToHarnessServiceProps {
  onSubmit: (data: GCOMonitoringSourceInfo) => Promise<void>
  onPrevious: () => void
  data: GCOMonitoringSourceInfo
}

export type MapGCOLogsQueryToService = {
  metricName: string
  serviceInstance?: string
  messageIdentifier?: string
  query: string
}

export interface GCOLogsQueryDefinition {
  name: string
  query: string
  serviceInstanceIdentifier?: string
  messageIdentifier?: string
}

export type GCOLogsHealthSourceSpec = HealthSourceSpec & {
  connectorRef: string
  feature: string
  queries: GCOLogsQueryDefinition[]
}
export interface GCOLogsHealthSourcePayload {
  name: string
  type: HealthSourceTypes.StackdriverLog
  identifier: string
  spec: GCOLogsHealthSourceSpec
}
