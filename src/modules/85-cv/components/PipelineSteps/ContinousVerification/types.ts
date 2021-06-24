import type { SelectOption } from '@wings-software/uicore'
import type { AllFailureStrategyConfig } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/FailureStrategyPanel'
import type { StepElementConfig } from 'services/cd-ng'
import type { VariableResponseMapValue } from 'services/pipeline-ng'

export interface ContinousVerificationVariableStepProps {
  metadataMap: Record<string, VariableResponseMapValue>
  stageIdentifier: string
  variablesData: ContinousVerificationData
  originalData: ContinousVerificationData
}

export interface spec {
  sensitivity?: SelectOption | string
  duration?: SelectOption | string
  trafficsplit?: SelectOption | string
  baseline?: SelectOption | string
  serviceRef?: string
  envRef?: string
  deploymentTag?: string
  [x: string]: any
}

export interface ContinousVerificationData extends StepElementConfig {
  failureStrategies: AllFailureStrategyConfig[]
  spec: {
    verificationJobRef?: SelectOption | string
    type?: string
    spec?: spec
  }
}
