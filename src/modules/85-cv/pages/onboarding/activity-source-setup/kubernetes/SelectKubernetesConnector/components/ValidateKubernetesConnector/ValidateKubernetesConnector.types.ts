import type { IconName } from '@wings-software/uicore'

export interface StatusMap {
  [key: string]: {
    style: {
      icon: string
      label: string
    }
    icon: IconName
    testId: string
  }
}
