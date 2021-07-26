import type { StepWhenCondition } from 'services/cd-ng'

export type WhenConditionStatus = StepWhenCondition['stageStatus']

// TODO: fix casing for this
export const PipelineOrStageStatus: Record<string, WhenConditionStatus> = {
  SUCCESS: 'Success',
  ALL: 'All',
  FAILURE: 'Failure'
}

export interface ConditionalExecutionConfig {
  status: WhenConditionStatus
  condition: string
}

export interface ConditionalExecutionOption extends ConditionalExecutionConfig {
  enableJEXL: boolean
}

export const ModeEntityNameMap = {
  STAGE: 'stage',
  STEP_GROUP: 'step group',
  STEP: 'step'
}

export const ParentModeEntityNameMap = {
  STAGE: 'pipeline',
  STEP_GROUP: 'stage',
  STEP: 'stage'
}

export const statusToStatusMapping: any = {
  OnPipelineSuccess: PipelineOrStageStatus.SUCCESS,
  OnStageSuccess: PipelineOrStageStatus.SUCCESS,
  OnPipelineFailure: PipelineOrStageStatus.FAILURE,
  OnStageFailure: PipelineOrStageStatus.FAILURE,
  Always: PipelineOrStageStatus.ALL
}
