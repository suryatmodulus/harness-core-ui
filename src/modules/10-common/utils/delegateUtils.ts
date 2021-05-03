import type { IconName } from '@wings-software/uicore'

export const delegateTypeToIcon = (delegateType: string): IconName => {
  let icon: IconName = 'cube'

  // TODO: these strings are not finalized from backend. Use strings for now
  switch ((delegateType || '').toLowerCase()) {
    case 'kubernetes':
    case 'ce_kubernetes':
      icon = 'app-kubernetes'
      break
    case 'ecs':
      icon = 'service-ecs'
      break
    case 'docker':
      icon = 'service-dockerhub'
      break
    case 'linux':
      icon = 'cube'
      break
    case 'shell_script':
      icon = 'run-step'
      break
  }

  return icon
}
