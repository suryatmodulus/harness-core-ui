export enum PipelineOrStageStatus {
  SUCCESS = 'Success',
  ALL = 'All',
  FAILURE = 'Failure'
}

export interface ConditionalExecutionOption {
  status: PipelineOrStageStatus
  enableJEXL: boolean
  condition: string
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

export const StatusToStringIdMapping: any = {
  OnPipelineSuccess: 'pipeline.conditionalExecution.statusOption.success',
  OnStageSuccess: 'pipeline.conditionalExecution.statusOption.success',
  OnPipelineFailure: 'pipeline.conditionalExecution.statusOption.failure',
  OnStageFailure: 'pipeline.conditionalExecution.statusOption.failure',
  Always: 'pipeline.conditionalExecution.statusOption.all'
}

export const statusToStatusMapping: any = {
  OnPipelineSuccess: PipelineOrStageStatus.SUCCESS,
  OnStageSuccess: PipelineOrStageStatus.SUCCESS,
  OnPipelineFailure: PipelineOrStageStatus.FAILURE,
  OnStageFailure: PipelineOrStageStatus.FAILURE,
  Always: PipelineOrStageStatus.ALL
}
