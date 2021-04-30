import type { Scope } from '@common/interfaces/SecretsInterface'
import type { DSConfig } from 'services/cv'

export interface PrometheusSetupSource extends DSConfig {
  isEdit: boolean
  url?: string
  connectorRef?: {
    label: string
    scope: Scope
    value: string
  }
}

export interface PrometheusDSConfig extends DSConfig {
  url?: string
}

export const PrometheusTabIndex = {
  SELECT_CONNECTOR: 0
}

export const PrometheusProductNames = {
  APM: 'apm'
}
