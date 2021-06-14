import { Color } from '@wings-software/uicore'
import type { StatusMap } from './ValidateKubernetesConnector.types'

export const STATUSMAP: StatusMap = {
  error: {
    style: {
      icon: Color.RED_500,
      label: Color.RED_600
    },
    icon: 'error',
    testId: 'connectorError'
  },
  success: {
    style: {
      icon: Color.GREEN_500,
      label: Color.GREEN_600
    },
    icon: 'tick',
    testId: 'connectorSuccess'
  },
  progress: {
    style: {
      icon: Color.YELLOW_500,
      label: Color.GREY_600
    },
    icon: 'steps-spinner',
    testId: 'connectorProgress'
  }
}
