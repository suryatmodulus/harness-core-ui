import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'

export interface PipelineStageProps<T = Record<string, unknown>> {
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

export abstract class PipelineStage<T = Record<string, unknown>> extends React.Component<PipelineStageProps<T>> {}
