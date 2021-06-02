import type { InputSetDTO } from '@pipeline/components/InputSetForm/InputSetForm'
import type {
  StageExecutionSummaryDTO,
  ParallelStageExecutionSummaryDTO,
  CDStageExecutionSummaryDTO
} from 'services/cd-ng'

export function isParallelStage(parallel?: StageExecutionSummaryDTO): parallel is ParallelStageExecutionSummaryDTO {
  return !!parallel && Array.isArray(parallel.stageExecutions)
}

export function isCDStage(stage?: StageExecutionSummaryDTO): stage is CDStageExecutionSummaryDTO {
  return !!stage
}

export const changeEmptyValuesToRunTimeInput = (inputset: any): InputSetDTO => {
  Object.keys(inputset).map(key => {
    if (typeof inputset[key] === 'object') {
      changeEmptyValuesToRunTimeInput(inputset[key])
    } else if (inputset[key] === '') {
      inputset[key] = '<+input>'
    }
  })
  return inputset
}
