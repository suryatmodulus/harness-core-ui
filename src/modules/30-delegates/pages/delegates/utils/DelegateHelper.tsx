import type { IconName } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { DelegateTypes } from '@delegates/constants'

export const GetDelegateTitleTextByType = (type: string): string => {
  const { getString } = useStrings()

  switch (type) {
    case DelegateTypes.KUBERNETES_CLUSTER:
      return getString('kubernetesText')
    default:
      /* istanbul ignore next */
      return ''
  }
}

export enum Size {
  'SMALL',
  'MEDIUM',
  'LARGE',
  'EXTRA_SMALL'
}

export const DelegateSizeArr = [
  {
    text: 'Small',
    value: Size.SMALL
  },
  {
    text: 'Extra Small',
    value: Size.EXTRA_SMALL
  },
  {
    text: 'Medium',
    value: Size.MEDIUM
  },
  {
    text: 'Large',
    value: Size.LARGE
  }
]
export interface DelegateSize {
  size: string
  label: string
  ram: string
  replicas: string
  taskLimit: string
  cpu: number
}

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

export enum DelegateTab {
  DELEGATES = 'delegates',
  CONFIGURATIONS = 'configurations'
}
