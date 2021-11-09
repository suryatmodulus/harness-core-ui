import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { StepPalleteModuleInfo } from 'services/pipeline-ng'

export enum StepMode {
  STAGE = 'STAGE',
  STEP_GROUP = 'STEP_GROUP',
  STEP = 'STEP'
}

export function isHarnessApproval(stepType?: string): boolean {
  return stepType === StepType.HarnessApproval
}

export function isJiraApproval(stepType?: string): boolean {
  return stepType === StepType.JiraApproval
}

export function isApprovalStep(stepType?: string): boolean {
  return isHarnessApproval(stepType) || isJiraApproval(stepType)
}

export function getAllStepPaletteModuleInfos(): StepPalleteModuleInfo[] {
  return [
    {
      module: 'cd',
      shouldShowCommonSteps: false
    },
    {
      module: 'ci',
      shouldShowCommonSteps: true
    },
    {
      module: 'cv',
      shouldShowCommonSteps: false
    }
  ]
}

export function getStepPaletteModuleInfosFromStage(stageType?: string): StepPalleteModuleInfo[] {
  return stageType === StageType.BUILD
    ? [
        {
          module: 'ci',
          shouldShowCommonSteps: false
        }
      ]
    : [
        {
          module: 'cd',
          category: stageType === StageType.APPROVAL ? 'Approval' : undefined,
          shouldShowCommonSteps: true
        },
        {
          module: 'cv',
          shouldShowCommonSteps: false
        }
      ]
}
