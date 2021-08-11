import React from 'react'
import type { IconName } from '@blueprintjs/core'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { PipelineContextInterface } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineStagesProps } from '@pipeline/components/PipelineStages/PipelineStages'
import type { ApprovalStageMinimalModeProps } from '../types'

export const getPropsForMinimalStage = (): PipelineStagesProps<ApprovalStageMinimalModeProps> => ({
  minimal: true,
  stageProps: {
    data: {
      stage: {
        identifier: '',
        name: ''
      } as any
    } as any,
    onSubmit: jest.fn(),
    onChange: jest.fn()
  },
  children: [
    {
      props: {
        name: '',
        type: 'APPROVAL',
        icon: 'nav-harness',
        isApproval: true,
        isDisabled: false,
        title: 'ApprovalStage',
        description: ''
      },
      type: '',
      key: 'approval'
    }
  ]
})

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
}

class StepOne extends Step<Record<string, any>> {
  protected type = StepType.HarnessApproval
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): Record<string, any> {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<Record<string, any>>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}

class StepTwo extends Step<Record<string, any>> {
  protected type = StepType.CustomVariable
  protected stepName = 'stepTwo'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): Record<string, any> {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<Record<string, any>>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}

const stepFactory = new StepFactory()
stepFactory.registerStep(new StepOne())
stepFactory.registerStep(new StepTwo())

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

export const pipelineContextMock = {
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
    isLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated: true,
    isInitialized: true,
    error: ''
  },
  stepsFactory: stepFactory,
  stagesMap
}

export const pipelineContextMockJiraApproval = {
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
    selectionState: { selectedStageId: 'ApprovalStep', selectedStepId: 'jiraApproval' },
    isLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated: true,
    isInitialized: true,
    error: ''
  },
  stepsFactory: stepFactory,
  stagesMap
}

export const mockYamlSnippetResponse = {
  loading: false,
  error: null,
  data: {
    status: 'SUCCESS',
    data: 'spec:\n  execution:\n    steps:\n      - step:\n          name: "Approval"\n          identifier: approval\n          type: HarnessApproval\n          timeout: 1d\n          spec:\n            approvalMessage: |-\n              Please review the following information\n              and approve the pipeline progression\n            includePipelineExecutionHistory: true\n            approvers:\n              minimumCount: 1\n              disallowPipelineExecutor: false\n',
    metaData: null as unknown as undefined,
    correlationId: 'someId'
  }
}

export const mockYamlSnippetResponseJira = {
  loading: false,
  error: null,
  data: {
    status: 'SUCCESS',
    data: 'spec:\n  execution:\n    steps:\n      - step:\n          name: "Jira Create"\n          identifier: jiraCreate\n          type: JiraCreate\n          timeout: 5m\n          spec:\n            fields: []\n      - step:\n          name: "Jira Approval"\n          identifier: jiraApproval\n          type: JiraApproval\n          timeout: 1d\n          spec:\n            approvalCriteria:\n              type: KeyValues\n              spec:\n                matchAnyCondition: false\n                conditions: []\n            rejectionCriteria:\n              type: KeyValues\n              spec:\n                matchAnyCondition: false\n                conditions: []\n      - step:\n          name: "Jira Update"\n          identifier: jiraUpdate\n          type: JiraUpdate\n          timeout: 5m\n          spec:\n            fields: []\n',
    metaData: null as unknown as undefined,
    correlationId: 'someId'
  }
}

export const getDummyPipelineContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    updateStage: jest.fn().mockResolvedValue({}),
    setSelectedTabId: jest.fn(),
    getStagePathFromPipeline: jest.fn(),
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}

export const getDummyPipelineContextValueJiraApproval = (): PipelineContextInterface => {
  return {
    ...pipelineContextMockJiraApproval,
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    updateStage: jest.fn().mockResolvedValue({}),
    setSelectedTabId: jest.fn(),
    getStagePathFromPipeline: jest.fn(),
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMockJiraApproval.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}
