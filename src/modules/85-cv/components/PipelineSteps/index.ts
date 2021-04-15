import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'

import { ContinousVerificationStep } from './ContinousVerification/ContinousVerificationStep'

factory.registerStep(new ContinousVerificationStep())
