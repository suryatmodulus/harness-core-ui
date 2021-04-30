import { omit } from 'lodash-es'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { DSConfig } from 'services/cv'
import { PrometheusDSConfig, PrometheusProductNames, PrometheusSetupSource } from './constants'
import { PrometheusTabIndex } from './constants'

export function determineMaxTab(_: PrometheusSetupSource): number {
  return PrometheusTabIndex.SELECT_CONNECTOR
}

export function buildDefaultPrometheusMonitoringSource({
  orgIdentifier,
  projectIdentifier,
  accountId
}: ProjectPathProps): PrometheusSetupSource {
  return {
    monitoringSourceName: 'Prometheus',
    accountId,
    orgIdentifier,
    projectIdentifier,
    isEdit: false,
    productName: PrometheusProductNames.APM,
    identifier: 'Prometheus',
    type: 'PROMETHEUS' as DSConfig['type'],
    url: ''
  }
}

export function transformPrometheusDSConfigIntoPrometheusSetupSource(
  params: ProjectPathProps,
  dsConfig?: PrometheusDSConfig | null
): PrometheusSetupSource {
  if (!dsConfig) {
    return buildDefaultPrometheusMonitoringSource(params)
  }

  const setupSource: PrometheusSetupSource = omit({ ...dsConfig, isEdit: true, url: dsConfig.url })

  setupSource.connectorRef = {
    value: dsConfig.connectorIdentifier as string,
    label: dsConfig.connectorIdentifier as string
  } as any

  return setupSource
}
