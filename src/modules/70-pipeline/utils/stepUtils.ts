import { get } from 'lodash-es'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { StageElementConfig } from 'services/cd-ng'
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
  return isHarnessApproval(stepType) || isJiraApproval(stepType) || isServiceNowApproval(stepType)
}

export function isServiceNowApproval(stepType?: string): boolean {
  return stepType === StepType.ServiceNowApproval
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

export function getStepPaletteModuleInfosFromStage(
  stageType?: string,
  stage?: StageElementConfig,
  initialCategory?: string
): StepPalleteModuleInfo[] {
  const deploymentType = get(stage, 'spec.serviceConfig.serviceDefinition.type', undefined)
  let category = initialCategory
  switch (deploymentType) {
    case 'Kubernetes':
      category = 'Kubernetes'
      break
    case 'NativeHelm':
      category = 'Helm'
      break
  }
  switch (stageType) {
    case StageType.BUILD:
      return [
        {
          module: 'ci',
          shouldShowCommonSteps: false
        }
      ]

    case StageType.FEATURE:
      return [
        {
          module: 'pms',
          category: 'FeatureFlag',
          shouldShowCommonSteps: true
        }
      ]

    default:
      return [
        {
          module: 'cd',
          category: stageType === StageType.APPROVAL ? 'Approval' : category,
          shouldShowCommonSteps: true
        },
        {
          module: 'cv',
          shouldShowCommonSteps: false
        }
      ]
  }
}
