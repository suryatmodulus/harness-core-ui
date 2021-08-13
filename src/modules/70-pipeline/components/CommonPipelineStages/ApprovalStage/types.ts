import type React from 'react'
import type { tagsType } from '@common/utils/types'
import type { ApprovalStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'

export interface ApprovalStageMinimalModeProps {
  data?: StageElementWrapper<ApprovalStageElementConfig>
  onSubmit?: (values: StageElementWrapper<ApprovalStageElementConfig>, identifier: string) => void
  onChange?: (values: ApprovalStageMinimalValues) => void
}

export interface ApprovalStageMinimalValues {
  identifier: string
  name: string
  description?: string
  tags?: tagsType
  approvalType: string
}

export interface ApprovalStageOverviewProps {
  name?: string
  children: React.ReactNode
}
