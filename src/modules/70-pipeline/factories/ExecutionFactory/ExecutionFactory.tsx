import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StageType } from '@pipeline/utils/stageHelpers'

import type { StepDetailsRegister, ExecutionCardInfoRegister, ExecutionSummaryRegister } from './types'

export class ExecutionFactory {
  private stepDetailsMap = new Map<StepType, StepDetailsRegister>()

  private defaultStepDetails!: StepDetailsRegister

  private cardInfoMap = new Map<StageType, ExecutionCardInfoRegister>()

  private summaryInfoMap = new Map<StageType, ExecutionSummaryRegister>()

  registerDefaultStepDetails(defaultRegister: StepDetailsRegister): void {
    this.defaultStepDetails = defaultRegister
  }

  registerStepDetails(stepType: StepType, stepDetails: StepDetailsRegister): void {
    if (this.stepDetailsMap.has(stepType)) {
      throw new Error(`Step of type "${stepType}" is already registred`)
    }

    this.stepDetailsMap.set(stepType, stepDetails)
  }

  getStepDetails(stepType?: StepType): StepDetailsRegister {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return stepType && this.stepDetailsMap.has(stepType) ? this.stepDetailsMap.get(stepType)! : this.defaultStepDetails
  }

  registerCardInfo(type: StageType, data: ExecutionCardInfoRegister): void {
    this.cardInfoMap.set(type, data)
  }

  getCardInfo(type: StageType): ExecutionCardInfoRegister | null {
    return this.cardInfoMap.get(type) || null
  }

  registerSummary(type: StageType, data: ExecutionSummaryRegister): void {
    this.summaryInfoMap.set(type, data)
  }

  getSummary(type: StageType): ExecutionSummaryRegister | null {
    return this.summaryInfoMap.get(type) || null
  }
}
