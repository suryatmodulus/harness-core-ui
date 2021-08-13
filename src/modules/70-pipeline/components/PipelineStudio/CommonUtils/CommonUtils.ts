import { defaultTo } from 'lodash-es'
import type { MultiSelectOption, SelectOption } from '@wings-software/uicore'
import type { PipelineInfoConfig, StageElementWrapperConfig } from 'services/cd-ng'
import { EmptyStageName } from '../PipelineConstants'

export interface StageSelectOption extends SelectOption {
  node: any
  type: string
}

export function getStagesMultiSelectOptionFromPipeline(pipeline: PipelineInfoConfig): MultiSelectOption[] {
  return getStagesFromPipeline(pipeline).map(node => ({
    label: defaultTo(node.stage?.name, ''),
    value: defaultTo(node.stage?.identifier, '')
  }))
}

export function getSelectStageOptionsFromPipeline(pipeline: PipelineInfoConfig): StageSelectOption[] {
  return getStagesFromPipeline(pipeline).map(node => ({
    label: defaultTo(node.stage?.name, ''),
    value: defaultTo(node.stage?.identifier, ''),
    node: node,
    type: defaultTo(node.stage?.type, '')
  }))
}

export function getStagesFromPipeline(pipeline: PipelineInfoConfig): StageElementWrapperConfig[] {
  const stages: StageElementWrapperConfig[] = []
  if (pipeline.stages) {
    pipeline.stages.forEach((node: StageElementWrapperConfig) => {
      if (node.stage && node.stage.name !== EmptyStageName) {
        stages.push(node)
      } else if (node.parallel) {
        node.parallel.forEach((parallelNode: StageElementWrapperConfig) => {
          if (parallelNode.stage && parallelNode.stage.name !== EmptyStageName) {
            stages.push(parallelNode)
          }
        })
      }
    })
  }
  return stages
}
