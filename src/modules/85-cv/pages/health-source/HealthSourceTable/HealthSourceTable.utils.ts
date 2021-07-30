import { Connectors } from '@connectors/constants'
import type { UseStringsReturn } from 'framework/strings'
import { HealthSourceTypes } from '../types'

export const getTypeByFeature = (feature: string, getString: UseStringsReturn['getString']): string => {
  switch (feature) {
    case Connectors.APP_DYNAMICS:
    case Connectors.GCP:
    case Connectors.PROMETHEUS:
    case HealthSourceTypes.StackdriverMetrics:
      return getString('pipeline.verification.analysisTab.metrics')
    case HealthSourceTypes.StackdriverLog:
      return getString('pipeline.verification.analysisTab.logs')
    default:
      return ''
  }
}
