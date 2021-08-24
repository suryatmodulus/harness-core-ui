import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { isFFPipelinesEnabled } from '@cf/utils/pipelinesEnabled'
import { FlagConfigurationStep } from './FlagConfigurationStep/FlagConfigurationStep'

if (isFFPipelinesEnabled()) {
  factory.registerStep(new FlagConfigurationStep())
}
