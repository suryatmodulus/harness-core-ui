import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { getStepType } from '@pipeline/utils/templateUtils'

export const ActivitySourceSetupRoutePaths = {
  KUBERNETES: 'kubernetes',
  HARNESS_CD: 'harness-cd'
}
export const MonitoringSourceSetupRoutePaths = {
  APP_DYNAMICS: 'app-dynamics',
  GOOGLE_CLOUD_OPERATIONS: 'google-cloud-operations',
  NEW_RELIC: 'new-relic',
  PROMETHEUS: 'prometheus'
}

export const getRoutePathByType = (type: any) => {
  switch (type) {
    case 'KUBERNETES':
      return ActivitySourceSetupRoutePaths.KUBERNETES
    case 'HARNESS_CD10':
      return ActivitySourceSetupRoutePaths.HARNESS_CD
    case 'APP_DYNAMICS':
      return MonitoringSourceSetupRoutePaths.APP_DYNAMICS
    case 'STACKDRIVER':
      return MonitoringSourceSetupRoutePaths.GOOGLE_CLOUD_OPERATIONS
    case 'STACKDRIVER_LOG':
      return MonitoringSourceSetupRoutePaths.GOOGLE_CLOUD_OPERATIONS
    case 'NEW_RELIC':
      return MonitoringSourceSetupRoutePaths.NEW_RELIC
    case 'PROMETHEUS':
      return MonitoringSourceSetupRoutePaths.PROMETHEUS
    default:
      return ''
  }
}

export const editParams = {
  identifier: ':identifier'
}

export const isVerifyStepPresent = (pipeline: PipelineInfoConfig): boolean => {
  return !!pipeline?.stages?.some(el =>
    el?.stage?.spec?.execution?.steps?.some(step => {
      if (step?.step) {
        return getStepType(step?.step) === StepType.Verify
      } else {
        return false
      }
    })
  )
}
