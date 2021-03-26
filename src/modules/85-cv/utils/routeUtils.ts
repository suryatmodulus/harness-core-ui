import type { ActivitySourceDTO, DSConfig } from 'services/cv'

export const ActivitySourceSetupRoutePaths = {
  KUBERNETES: 'kubernetes',
  HARNESS_CD: 'harness-cd'
}
export const MonitoringSourceSetupRoutePaths = {
  APP_DYNAMICS: 'app-dynamics',
  GOOGLE_CLOUD_OPERATIONS: 'google-cloud-operations',
  NEW_RELIC: 'new-relic'
}

export const getRoutePathByType = (type: DSConfig['type'] | ActivitySourceDTO['type']) => {
  switch (type) {
    case 'KUBERNETES':
      return ActivitySourceSetupRoutePaths.KUBERNETES
    case 'HARNESS_CD10':
      return ActivitySourceSetupRoutePaths.HARNESS_CD
    case 'APP_DYNAMICS':
      return MonitoringSourceSetupRoutePaths.APP_DYNAMICS
    case 'STACKDRIVER':
      return MonitoringSourceSetupRoutePaths.GOOGLE_CLOUD_OPERATIONS
    case 'NEW_RELIC':
      return MonitoringSourceSetupRoutePaths.NEW_RELIC
    default:
      return ''
  }
}
