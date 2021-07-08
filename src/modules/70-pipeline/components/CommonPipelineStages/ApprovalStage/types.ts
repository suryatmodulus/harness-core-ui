import type React from 'react'
import type { tagsType } from '@common/utils/types'
import type { StageElementWrapper } from 'services/cd-ng'

export enum ApprovalType {
  HARNESS = 'HARNESS',
  JIRA = 'JIRA',
  SERVICENOW = 'SERVICENOW'
}

export interface ApprovalStageMinimalModeProps {
  data?: StageElementWrapper
  onSubmit?: (values: StageElementWrapper, identifier: string) => void
  onChange?: (values: StageElementWrapper) => void
}

export interface ApprovalStageMinimalValues {
  identifier: string
  name: string
  description?: string
  tags?: tagsType
  approvalType: ApprovalType
}

export interface ApprovalStageOverviewProps {
  name?: string
  children: React.ReactNode
}
