import type { SelectOption } from '@wings-software/uicore'
import { omit } from 'lodash-es'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { DSConfig, MetricPackDTO } from 'services/cv'
import type { Scope } from '@common/interfaces/SecretsInterface'

export const NewRelicProductNames = {
  APM: 'apm'
}

export type NewRelicServiceEnvMapping = {
  service: SelectOption
  environment: SelectOption
  applicationId: number
  applicationName: string
  guid?: string
}
export interface NewRelicSetupSource extends DSConfig {
  mappedServicesAndEnvs: Map<number, NewRelicServiceEnvMapping> // applicationId is the key
  connectorRef?: {
    label: string
    scope: Scope
    value: string
  }
  isEdit: boolean
  selectedMetricPacks?: MetricPackDTO[]
}

export interface NewRelicDSConfig extends DSConfig {
  newRelicServiceConfigList: Array<{
    applicationId: number
    applicationName: string
    envIdentifier: string
    serviceIdentifier: string
    metricPacks: MetricPackDTO[]
  }>
}

export function transformNewRelicDSConfigIntoNewRelicSetupSource(
  params: ProjectPathProps,
  dsConfig?: NewRelicDSConfig
): NewRelicSetupSource {
  if (!dsConfig) {
    return buildDefaultNewRelicMonitoringSource(params)
  }

  const setupSource: NewRelicSetupSource = omit(
    { ...dsConfig, isEdit: true, mappedServicesAndEnvs: new Map() },
    'newRelicServiceConfigList'
  )

  setupSource.connectorRef = {
    value: dsConfig.connectorIdentifier as string,
    label: dsConfig.connectorIdentifier as string
  } as any

  for (const config of dsConfig?.newRelicServiceConfigList || []) {
    const { applicationId, applicationName, envIdentifier, serviceIdentifier, metricPacks } = config || {}
    if (applicationId && applicationName && envIdentifier && serviceIdentifier && metricPacks?.length) {
      setupSource.mappedServicesAndEnvs.set(applicationId, {
        applicationId,
        applicationName,
        environment: { label: envIdentifier, value: envIdentifier },
        service: { label: serviceIdentifier, value: serviceIdentifier }
      })
    }
  }

  return setupSource
}

export function buildDefaultNewRelicMonitoringSource({
  orgIdentifier,
  projectIdentifier,
  accountId
}: ProjectPathProps): NewRelicSetupSource {
  return {
    monitoringSourceName: 'NewRelic',
    accountId,
    orgIdentifier,
    projectIdentifier,
    isEdit: false,
    productName: NewRelicProductNames.APM,
    identifier: 'NewRelic',
    type: 'NEW_RELIC',
    mappedServicesAndEnvs: new Map()
  }
}
