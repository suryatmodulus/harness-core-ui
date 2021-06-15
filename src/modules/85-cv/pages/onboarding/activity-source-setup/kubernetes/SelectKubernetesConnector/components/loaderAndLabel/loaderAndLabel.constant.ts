import { Color } from '@wings-software/uicore'
import type { StatusMap } from './loaderAndLabel.types'

export enum Status {
  Error = 'error',
  Progress = 'inProgress',
  Success = 'success'
}

export const STATUSMAP: StatusMap = {
  [Status.Error]: {
    style: {
      icon: Color.RED_500,
      label: Color.RED_600
    },
    icon: 'error',
    testId: 'connectorError'
  },
  [Status.Success]: {
    style: {
      icon: Color.GREEN_500,
      label: Color.GREEN_600
    },
    icon: 'tick',
    testId: 'connectorSuccess'
  },
  [Status.Progress]: {
    style: {
      icon: Color.YELLOW_500,
      label: Color.GREY_600
    },
    icon: 'steps-spinner',
    testId: 'connectorProgress'
  }
}
