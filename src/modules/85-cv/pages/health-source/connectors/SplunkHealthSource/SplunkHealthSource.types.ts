import type { MapSplunkQueryToService } from './components/MapQueriesToHarnessService/types'

export interface SplunkHealthSourceInfo {
  name?: string
  identifier?: string
  connectorRef?: string
  isEdit?: boolean
  product: string
  type: string
  mappedServicesAndEnvs: Map<string, MapSplunkQueryToService>
}
