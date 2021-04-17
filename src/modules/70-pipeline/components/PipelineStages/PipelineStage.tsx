import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'

// eslint-disable-next-line @typescript-eslint/ban-types
export interface PipelineStageProps<T = {}> {
  name: string
  type: string
  icon: IconName
  isDisabled: boolean
  title: string
  description: string
  isHidden?: boolean
  isApproval: boolean
  stageProps?: T
  iconsStyle?: React.CSSProperties
  iconsProps?: Omit<IconProps, 'name'>
  minimal?: boolean
}

// eslint-disable-next-line @typescript-eslint/ban-types
export abstract class PipelineStage<T = {}> extends React.Component<PipelineStageProps<T>> {}
