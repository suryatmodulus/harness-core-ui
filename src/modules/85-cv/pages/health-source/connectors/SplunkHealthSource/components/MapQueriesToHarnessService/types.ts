import type { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { HealthSourceSpec } from 'services/cv'
import type { SplunkHealthSourceInfo } from '../../SplunkHealthSource.types'

export interface SplunkQueryBuilderProps {
  onSubmit: (data: SplunkHealthSourceInfo) => Promise<void>
  onPrevious: () => void
  data: SplunkHealthSourceInfo
}

export type MapSplunkQueryToService = {
  metricName: string
  serviceInstance?: string
  query: string
}

export interface SplunkQueryDefinition {
  name: string
  query: string
  serviceInstanceIdentifier?: string
}

export type SplunkHealthSourceSpec = HealthSourceSpec & {
  connectorRef: string
  feature: string
  queries: SplunkQueryDefinition[]
}
export interface SplunkHealthSourcePayload {
  name: string
  type: HealthSourceTypes.Splunk
  identifier: string
  spec: SplunkHealthSourceSpec
}
