import { defaultTo } from 'lodash-es'
import type { MultiSelectOption, SelectOption } from '@wings-software/uicore'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { PipelineInfoConfig } from 'services/cd-ng'
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

export function getStagesFromPipeline(pipeline: PipelineInfoConfig): StageElementWrapper[] {
  const stages: StageElementWrapper[] = []
  if (pipeline.stages) {
    pipeline.stages.forEach((node: StageElementWrapper) => {
      if (node.stage && node.stage.name !== EmptyStageName) {
        stages.push(node)
      } else if (node.parallel) {
        node.parallel.forEach((parallelNode: StageElementWrapper) => {
          if (parallelNode.stage && parallelNode.stage.name !== EmptyStageName) {
            stages.push(parallelNode)
          }
        })
      }
    })
  }
  return stages
}
