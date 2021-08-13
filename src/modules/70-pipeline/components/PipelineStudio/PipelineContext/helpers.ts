import type { PipelineStageWrapper } from '@pipeline/utils/pipelineTypes'
import type { PipelineInfoConfig, StageElementConfig, StageElementWrapperConfig } from 'services/cd-ng'

export function getStageFromPipeline<T extends StageElementConfig = StageElementConfig>(
  stageId: string,
  localPipeline: PipelineInfoConfig
): PipelineStageWrapper<T> {
  let stage: StageElementWrapperConfig | undefined = undefined
  let parent: StageElementWrapperConfig | undefined = undefined
  if (localPipeline?.stages) {
    localPipeline.stages?.some?.(item => {
      if (item?.stage && item.stage.identifier === stageId) {
        stage = item
        return true
      } else if (item?.parallel) {
        stage = getStageFromPipeline(stageId, { stages: item.parallel } as unknown as PipelineInfoConfig).stage
        if (stage) {
          parent = item
          return true
        }
      }
    })
  }
  return { stage, parent }
}

export function getStagePathFromPipeline(stageId: string, prefix: string, pipeline: PipelineInfoConfig): string {
  if (Array.isArray(pipeline.stages)) {
    for (let i = 0; i < pipeline.stages.length; i++) {
      const item = pipeline.stages[i]

      if (item?.stage?.identifier === stageId) {
        return `${prefix}.${i}`
      }

      if (item.parallel) {
        return getStagePathFromPipeline(stageId, `${prefix}.${i}.parallel`, {
          stages: item.parallel
        } as PipelineInfoConfig)
      }
    }
  }

  return prefix
}
