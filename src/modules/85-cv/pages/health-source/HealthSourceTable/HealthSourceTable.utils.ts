import type { IconName } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { Connectors } from '@connectors/constants'
import type { UseStringsReturn } from 'framework/strings'
import { HealthSourceTypes } from '../types'
import type { UpdatedHealthSource, RowData } from '../HealthSourceDrawer/HealthSourceDrawerContent.types'

export const getTypeByFeature = (feature: string, getString: UseStringsReturn['getString']): string => {
  switch (feature) {
    case Connectors.APP_DYNAMICS:
    case Connectors.GCP:
    case Connectors.NEW_RELIC:
    case Connectors.PROMETHEUS:
    case HealthSourceTypes.StackdriverMetrics:
      return getString('pipeline.verification.analysisTab.metrics')
    case HealthSourceTypes.StackdriverLog:
    case HealthSourceTypes.Splunk:
      return getString('pipeline.verification.analysisTab.logs')
    default:
      return ''
  }
}

export const getIconBySourceType = (type: string): IconName => {
  switch (type) {
    case 'KUBERNETES':
      return 'service-kubernetes'
    case 'APP_DYNAMICS':
    case 'AppDynamics':
      return 'service-appdynamics'
    case 'HARNESS_CD10':
      return 'harness'
    case 'STACKDRIVER':
      return 'service-stackdriver'
    case 'NEW_RELIC':
    case 'NewRelic':
      return 'service-newrelic'
    case 'HEALTH':
      return 'health'
    case 'CANARY':
      return 'canary-outline'
    case 'BLUE_GREEN':
      return 'bluegreen'
    case 'TEST':
      return 'lab-test'
    case 'PROMETHEUS':
    case 'Prometheus':
      return 'service-prometheus'
    //TODO one type will be removed once it is full deprecated from backend.
    case 'STACKDRIVER_LOG':
    case 'StackdriverLog':
    case 'Stackdriver':
      return 'service-stackdriver'
    case 'SPLUNK':
    case 'Splunk':
      return 'service-splunk'
    default:
      return 'placeholder'
  }
}

export const createHealthsourceList = (
  healthSources: RowData[],
  healthSourcesPayload: UpdatedHealthSource
): UpdatedHealthSource[] => {
  let updatedHealthSources = []
  if (
    healthSources &&
    !isEmpty(healthSources) &&
    healthSources.some(
      (el: any) => el?.identifier === healthSourcesPayload?.identifier && el?.type === healthSourcesPayload?.type
    )
  ) {
    updatedHealthSources = healthSources?.map((el: any) =>
      el?.identifier === healthSourcesPayload?.identifier ? healthSourcesPayload : el
    )
  } else if (healthSources && !isEmpty(healthSources)) {
    updatedHealthSources = [...healthSources, healthSourcesPayload]
  } else {
    updatedHealthSources = [healthSourcesPayload]
  }
  return updatedHealthSources
}
