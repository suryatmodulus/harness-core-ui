import factory from '@pipeline/factories/ExecutionFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ExecutionVerificationSummary } from './components/ExecutionVerificationSummary/ExecutionVerificationSummary'
import { ExecutionVerificationView } from './ExecutionVerificationView'

factory.registerStepDetails(StepType.Verify, {
  component: ExecutionVerificationSummary
})

factory.registerConsoleViewStepDetails(StepType.Verify, {
  component: ExecutionVerificationView
})
