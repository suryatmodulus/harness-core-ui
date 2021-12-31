import type React from 'react'
import type { tagsType } from '@wings-software/uicore'
import type { ApprovalStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { TemplateSummaryResponse } from 'services/template-ng'

export interface ApprovalStageMinimalModeProps {
  data?: StageElementWrapper<ApprovalStageElementConfig>
  template?: TemplateSummaryResponse
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
