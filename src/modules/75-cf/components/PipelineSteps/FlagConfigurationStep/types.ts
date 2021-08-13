import type { StepElementConfig, HttpHeaderConfig, StringNGVariable, StepSpecType } from 'services/cd-ng'
import type { TargetAndSegment } from 'services/cf'

export interface HttpStepHeaderConfig extends HttpHeaderConfig {
  id: string
}

export interface HttpStepOutputVariable extends StringNGVariable {
  id: string
}

export interface FeatureFlagConfigurationSpec {
  feature: string
  environment: string
  instructions: Array<{
    identifier: string
    type: string // PatchInstruction
    spec: StepSpecType
  }>
}

export interface FlagConfigurationStepData extends StepElementConfig {
  spec: FeatureFlagConfigurationSpec
}

export enum CFPipelineInstructionType {
  SET_FEATURE_FLAG_STATE = 'SetFeatureFlagState',
  ADD_TARGETS_TO_VARIATION_TARGET_MAP = 'AddTargetsToVariationTargetMap'
}

export type TargetCollection = Array<Required<Omit<TargetAndSegment, 'type'>>>
export type TargetGroupCollection = Array<Required<Omit<TargetAndSegment, 'type'>>>

export interface VariationMapping {
  variationIdentifier: string
  instructionType: CFPipelineInstructionType
  targets?: TargetCollection
  targetGroups?: TargetGroupCollection
}

export interface ConditionalRulesMapping {
  name: string
  value: string
}

export interface FlagConfigurationStepFormData extends StepElementConfig {
  spec: {
    environment: string
    featureFlag: string
    state: string // 'on' | 'off' | '<+input>'
    defaultVariation?: string // Backend does not support yet
    variationMappings?: Record<string, VariationMapping>
    conditionalRulesMapping?: ConditionalRulesMapping // Backend does not support yet
  }
}
