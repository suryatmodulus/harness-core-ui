import type { MultiTypeInputType } from '@wings-software/uicore'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type {
  StepElementConfig,
  StepGroupElementConfig,
  StepWhenCondition,
  FailureStrategyConfig
} from 'services/cd-ng'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { TemplateStepNode, TemplateLinkConfig } from 'services/pipeline-ng'

export enum AdvancedPanels {
  PreRequisites = 'preRequisites',
  FailureStrategy = 'failureStrategy',
  DelegateSelectors = 'delegateSelectors',
  ConditionalExecution = 'conditionalExecution'
}

export enum StepCommandsViews {
  Pipeline = 'pipeline',
  Template = 'template'
}

export interface StepCommandsProps {
  step: StepOrStepGroupOrTemplateStepData
  onChange?: (step: Partial<Values>) => void
  onUpdate: (step: Partial<Values>) => void
  onUseTemplate?: () => void
  onRemoveTemplate?: () => Promise<void>
  stepsFactory: AbstractStepFactory
  isStepGroup: boolean
  isReadonly: boolean
  isNewStep?: boolean
  hasStepGroupAncestor?: boolean
  hiddenPanels?: AdvancedPanels[]
  withoutTabs?: boolean
  stageType?: StageType
  stepViewType?: StepViewType
  className?: string
  viewType?: StepCommandsViews
  allowableTypes: MultiTypeInputType[]
}

export enum TabTypes {
  StepConfiguration = 'STEP_CONFIGURATION',
  Advanced = 'ADVANCED'
}

export type StepOrStepGroupOrTemplateStepData = StepElementConfig | StepGroupElementConfig | TemplateStepNode

export type Values = StepOrStepGroupOrTemplateStepData & {
  tab?: TabTypes
  shouldKeepOpen?: boolean
  delegateSelectors?: string[]
  when?: StepWhenCondition
  failureStrategies?: FailureStrategyConfig[]
  template?: TemplateLinkConfig
}
