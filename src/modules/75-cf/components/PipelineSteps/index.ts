import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { FlagConfigurationStep } from './FlagConfigurationStep/FlagConfigurationStep'

factory.registerStep(new FlagConfigurationStep())
