import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { FlagConfigurationStep } from './FlagConfigurationStep/FlagConfigurationStep'

export function registerFlagConfigurationPipelineStep(): void {
  factory.registerStep(new FlagConfigurationStep())
}
