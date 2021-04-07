import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

export function isHarnessApproval(stepType?: string): boolean {
  return stepType === StepType.HarnessApproval
}

export function isJiraApproval(stepType?: string): boolean {
  return stepType === StepType.JiraApproval
}

export function isApprovalStep(stepType?: string): boolean {
  return isHarnessApproval(stepType) || isJiraApproval(stepType)
}
