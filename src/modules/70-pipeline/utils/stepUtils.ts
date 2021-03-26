import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

export function isApprovalStep(stepType?: string): boolean {
  return stepType === StepType.HarnessApproval || stepType === StepType.JiraApproval
}
