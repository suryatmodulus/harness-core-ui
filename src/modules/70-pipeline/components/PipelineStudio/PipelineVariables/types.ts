import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { PipelineInfoConfig } from 'services/cd-ng'

export interface PipelineVariablesData {
  variablesPipeline: PipelineInfoConfig
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}
