import type { IconName } from '@wings-software/uicore'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { PipelineContextInterface } from '../../PipelineContext/PipelineContext'

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
}
const stepFactory = new StepFactory()

const stagesMap = {
  Deployment: {
    name: 'Deploy',
    type: 'Deployment',
    icon: 'pipeline-deploy',
    iconColor: 'var(--pipeline-deploy-stage-color)',
    isApproval: false,
    openExecutionStrategy: true
  },
  ci: {
    name: 'Deploy',
    type: 'ci',
    icon: 'pipeline-build',
    iconColor: 'var(--pipeline-build-stage-color)',
    isApproval: false,
    openExecutionStrategy: false
  },
  Pipeline: {
    name: 'Deploy',
    type: 'Pipeline',
    icon: 'pipeline',
    iconColor: 'var(--pipeline-blue-color)',
    isApproval: false,
    openExecutionStrategy: false
  },
  Custom: {
    name: 'Deploy',
    type: 'Custom',
    icon: 'pipeline-custom',
    iconColor: 'var(--pipeline-custom-stage-color)',
    isApproval: false,
    openExecutionStrategy: false
  },
  Approval: {
    name: 'Deploy',
    type: 'Approval',
    icon: 'approval-stage-icon',
    iconColor: 'var(--pipeline-approval-stage-color)',
    isApproval: true,
    openExecutionStrategy: false
  }
}

export const getPipelineContextMockData = (
  isLoading = false,
  gitDetails?: any,
  isReadonly = false,
  isUpdated = false
) => ({
  state: {
    pipeline: {
      name: 'Pipeline',
      identifier: 'Pipeline',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'ApprovalStep',
            identifier: 'ApprovalStep',
            description: '',
            type: 'Approval',
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
            name: 'ApprovalStep',
            identifier: 'ApprovalStep',
            description: '',
            type: 'Approval',
            spec: {}
          }
        }
      ]
    },
    pipelineIdentifier: 'Pipeline',
    pipelineView: {
      isSplitViewOpen: true,
      isDrawerOpened: false,
      splitViewData: { type: 'StageView' },
      drawerData: { type: 'AddCommand' }
    },
    selectionState: { selectedStageId: 'ApprovalStep', selectedStepId: 'harnessApproval' },
    isLoading,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated,
    isInitialized: true,
    error: '',
    gitDetails
  },
  isReadonly,
  stepsFactory: stepFactory,
  stagesMap
})

export const getDummyPipelineCanvasContextValue = (params: any): PipelineContextInterface => {
  const { isLoading, gitDetails, isReadonly, isUpdated } = params
  const data = getPipelineContextMockData(isLoading, gitDetails, isReadonly, isUpdated)
  return {
    ...data,
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    updateStage: jest.fn().mockResolvedValue({}),
    setSelectedTabId: jest.fn(),
    getStagePathFromPipeline: jest.fn(),
    renderPipelineStage: jest.fn(),
    setSelectedStageId: jest.fn(),
    fetchPipeline: jest.fn(),
    setView: jest.fn(),
    setSchemaErrorView: jest.fn(),
    deletePipelineCache: jest.fn(),
    setSelectedSectionId: jest.fn(),
    getStageFromPipeline: jest.fn(() => {
      return { stage: data.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}

export const mockApiDataEmpty = {
  status: 'SUCCESS',
  data: 'XYZ',
  metaData: null,
  correlationId: '2ffac0a7-2447-49f8-b586-d922085f7536'
}

export const mockApiDataError = {
  status: 'Error',
  data: '',
  metaData: null,
  correlationId: '2ffac0a7-2447-49f8-b586-d922085f7536'
}
