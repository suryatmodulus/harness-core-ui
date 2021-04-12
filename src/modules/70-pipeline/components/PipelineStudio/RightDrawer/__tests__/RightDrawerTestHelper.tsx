import type { IconName } from '@wings-software/uicore'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { PipelineViewData } from '../../PipelineContext/PipelineActions'
import type { PipelineContextInterface } from '../../PipelineContext/PipelineContext'
import { StageTypes } from '../../Stages/StageTypes'

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
}

const stepFactory = new StepFactory()

const stagesMap = {
  Deployment: {
    name: 'Deploy',
    type: StageTypes.DEPLOY,
    icon: 'pipeline-deploy',
    iconColor: 'var(--pipeline-deploy-stage-color)',
    isApproval: false,
    openExecutionStrategy: true
  },
  ci: {
    name: 'Nuild',
    type: StageTypes.BUILD,
    icon: 'pipeline-build',
    iconColor: 'var(--pipeline-build-stage-color)',
    isApproval: false,
    openExecutionStrategy: false
  },
  Pipeline: {
    name: 'Pipeline',
    type: StageTypes.PIPELINE,
    icon: 'pipeline',
    iconColor: 'var(--pipeline-blue-color)',
    isApproval: false,
    openExecutionStrategy: false
  },
  Custom: {
    name: 'Custom',
    type: StageTypes.CUSTOM,
    icon: 'pipeline-custom',
    iconColor: 'var(--pipeline-custom-stage-color)',
    isApproval: false,
    openExecutionStrategy: false
  },
  Approval: {
    name: 'Approval',
    type: StageTypes.APPROVAL,
    icon: 'pipeline-approval',
    iconColor: 'var(--pipeline-approval-stage-color)',
    isApproval: true,
    openExecutionStrategy: false
  }
}

export const getPipelineContextMock = (pipelineView: PipelineViewData) => ({
  state: {
    pipeline: {
      name: 'Pipeline',
      identifier: 'Pipeline',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'ApprovalStage',
            identifier: 'ApprovalStageId',
            description: '',
            type: StageTypes.APPROVAL,
            spec: {}
          }
        }
      ]
    },
    originalPipeline: {
      name: 'Pipeline',
      identifier: 'Pipeline',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'ApprovalStage',
            identifier: 'ApprovalStageId',
            description: '',
            type: StageTypes.APPROVAL,
            spec: {}
          }
        }
      ]
    },
    pipelineIdentifier: 'Pipeline',
    pipelineView,
    isLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated: true,
    isInitialized: true,
    error: ''
  },
  stepsFactory: stepFactory,
  stagesMap
})

export const getDummyPipelineContextValue = (pipelineView: any): PipelineContextInterface => {
  const pipelineContextMock = getPipelineContextMock(pipelineView)
  return {
    ...pipelineContextMock,
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    updateStage: jest.fn(),
    setSelectedTabId: jest.fn(),
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}
