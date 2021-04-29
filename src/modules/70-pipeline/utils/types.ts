import type { StringNGVariable, NumberNGVariable, SecretNGVariable } from 'services/cd-ng'
import type { PipelineOrStageStatus } from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils'

export type AllNGVariables = StringNGVariable | NumberNGVariable | SecretNGVariable

export interface ExecutionPageQueryParams {
  stage?: string
  step?: string
  retryStep?: string
}

export interface ConditionalExecutionStageConfig {
  pipelineStatus: PipelineOrStageStatus.SUCCESS | PipelineOrStageStatus.ALL | PipelineOrStageStatus.FAILURE
  condition?: string
}

export interface ConditionalExecutionStepOrSetGroupConfig {
  stageStatus: PipelineOrStageStatus.SUCCESS | PipelineOrStageStatus.ALL | PipelineOrStageStatus.FAILURE
  condition?: string
}
