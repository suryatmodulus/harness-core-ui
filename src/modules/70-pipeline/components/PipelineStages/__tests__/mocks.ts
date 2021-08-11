import { StageType } from '@pipeline/utils/stageHelpers'
import type { PipelineStageProps } from '../PipelineStage'

export const stageMockData: Array<PipelineStageProps> = [
  {
    name: 'Deploy',
    type: StageType.DEPLOY,
    icon: 'cd-main',
    hoverIcon: 'deploy-stage',
    isDisabled: false,
    title: 'Deploy Stage',
    description: 'pipeline.pipelineSteps.deployStageDescription',
    isHidden: false,
    isApproval: false
  },
  {
    name: 'Build',
    type: StageType.BUILD,
    icon: 'ci-main',
    hoverIcon: 'build-stage',
    isDisabled: false,
    title: 'Build Stage',
    description: 'ci.description',
    isHidden: false,
    isApproval: false
  },
  {
    name: 'Feature Flag',
    type: StageType.FEATURE,
    icon: 'cf-main',
    hoverIcon: 'feature-flag-stage',
    isDisabled: false,
    title: 'Feature Flag Stage',
    description: 'pipeline.pipelineSteps.featureStageDescription',
    isHidden: false,
    isApproval: false
  },
  {
    name: 'Approval Stage',
    type: StageType.APPROVAL,
    icon: 'approval-stage-icon',
    hoverIcon: 'approval-stage',
    isDisabled: false,
    title: 'Approval Stage',
    description: 'pipeline.pipelineSteps.approvalStageDescription',
    isHidden: false,
    isApproval: false
  },
  {
    name: 'Chained Pipeline',
    type: StageType.PIPELINE,
    icon: 'chained-pipeline',
    hoverIcon: 'chained-pipeline',
    isDisabled: true,
    title: 'Chained Pipeline',
    description: 'pipeline.pipelineSteps.chainedPipeline',
    isHidden: false,
    isApproval: false
  },
  {
    name: 'Custom Stage',
    type: StageType.CUSTOM,
    icon: 'custom-stage-icon',
    hoverIcon: 'custom-stage-icon',
    isDisabled: true,
    title: 'Custom Stage',
    description: 'pipeline.pipelineSteps.customStage',
    isHidden: false,
    isApproval: false
  }
]
