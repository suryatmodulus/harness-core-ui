import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { ExecutionWrapper } from 'services/cd-ng'
import type { Domain } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/StrategySelection/StrategyConfig'

export enum AdvancedPanels {
  PreRequisites = 'preRequisites',
  SkipCondition = 'skipCondition',
  FailureStrategy = 'failureStrategy',
  DelegateSelectors = 'delegateSelectors'
}
export interface StepCommandsProps {
  step: ExecutionWrapper
  onChange: (step: ExecutionWrapper) => void
  stepsFactory: AbstractStepFactory
  isStepGroup: boolean
  isReadonly: boolean
  isNewStep?: boolean
  hasStepGroupAncestor?: boolean
  hiddenPanels?: AdvancedPanels[]
  withoutTabs?: boolean
  domain?: Domain
}

export enum TabTypes {
  StepConfiguration = 'STEP_CONFIGURATION',
  Advanced = 'ADVANCED'
}

export interface Values {
  tab?: TabTypes
  skipCondition?: string
  shouldKeepOpen?: boolean
  failureStrategies?: any[]
  delegateSelectors?: string[]
}
