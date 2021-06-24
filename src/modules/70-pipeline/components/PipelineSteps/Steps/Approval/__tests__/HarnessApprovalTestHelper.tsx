import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { UseGetMockData } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ResponsePageUserGroupDTO } from 'services/cd-ng'
import type { HarnessApprovalStepModeProps } from '../types'

export const getHarnessApprovalEditModeProps = () => ({
  initialValues: {
    timeout: '5s',
    spec: {
      approvalMessage: '',
      includePipelineExecutionHistory: '',
      approverInputs: '',
      approvers: {
        userGroups: [],
        minimumCount: '',
        disallowPipelineExecutor: ''
      }
    }
  },
  onUpdate: jest.fn()
})

export const getHarnessApprovalEditModePropsWithValues = (): HarnessApprovalStepModeProps => ({
  initialValues: {
    timeout: '10m',
    type: 'HarnessApproval',
    name: 'harness approval step',
    identifier: 'hhaass',
    spec: {
      approvalMessage: 'Approving pipeline <+pname>',
      includePipelineExecutionHistory: true,
      approverInputs: [
        {
          name: 'somekey',
          defaultValue: 'somevalue'
        }
      ],
      approvers: {
        userGroups: ['ug1', 'ug2'],
        minimumCount: 1,
        disallowPipelineExecutor: true
      }
    }
  },
  onUpdate: jest.fn()
})

export const getHarnessApprovalDeploymentModeProps = () => ({
  initialValues: {
    spec: {
      approvalMessage: '',
      includePipelineExecutionHistory: false,
      approverInputs: [],
      approvers: {
        userGroups: [],
        minimumCount: 0,
        disallowPipelineExecutor: false
      }
    }
  },
  inputSetData: {
    path: '/ab/',
    template: {
      spec: {
        approvalMessage: RUNTIME_INPUT_VALUE,
        includePipelineExecutionHistory: RUNTIME_INPUT_VALUE,
        approverInputs: RUNTIME_INPUT_VALUE,
        approvers: {
          userGroups: RUNTIME_INPUT_VALUE,
          minimumCount: RUNTIME_INPUT_VALUE,
          disallowPipelineExecutor: RUNTIME_INPUT_VALUE
        }
      }
    }
  },
  onUpdate: jest.fn()
})

export const getHarnessApprovalInputVariableModeProps = () => ({
  initialValues: {
    spec: {}
  },
  customStepProps: {
    stageIdentifier: 'qaStage',
    metadataMap: {
      'step-name': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.name',
          localName: 'step.approval.name'
        }
      },
      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.timeout',
          localName: 'step.approval.timeout'
        }
      },
      'step-approvalMessage': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approvalMessage',
          localName: 'step.approval.spec.approvalMessage'
        }
      },
      'step-includePipelineExecutionHistory': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.includePipelineExecutionHistory',
          localName: 'step.approval.spec.includePipelineExecutionHistory'
        }
      },
      'step-approverusers': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approvers.users',
          localName: 'step.approval.spec.approvers.users'
        }
      },
      'step-approvergroups': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approvers.userGroups',
          localName: 'step.approval.spec.approvers.userGroups'
        }
      },
      'step-minimumCount': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approvers.minimumCount',
          localName: 'step.approval.spec.approvers.minimumCount'
        }
      },
      'step-disallowPipelineExecutor': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.disallowPipelineExecutor',
          localName: 'step.approval.spec.disallowPipelineExecutor'
        }
      },
      'step-approverInputs': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approverInputs',
          localName: 'step.approval.spec.approverInputs'
        }
      }
    },
    variablesData: {
      type: StepType.HarnessApproval,
      identifier: 'harness_approval',
      name: 'step-name',
      description: 'Description',
      timeout: 'step-timeout',
      spec: {
        approvalMessage: 'step-approvalMessage',
        includePipelineExecutionHistory: 'step-includePipelineExecutionHistory',
        approvers: {
          userGroups: 'step-approvergroups',
          minimumCount: 'step-minimumCount'
        },
        disallowPipelineExecutor: 'step-disallowPipelineExecutor',
        approverInputs: 'step-approverInputs'
      }
    }
  },
  onUpdate: jest.fn()
})

export const mockUsersResponse = {
  loading: false,
  error: null,
  data: {
    status: 'SUCCESS',
    content: [{ name: 'ug11', uuid: 'uv1' }],
    metaData: (null as unknown) as undefined,
    correlationId: 'someId'
  }
}

export const mockUserGroupsResponse: UseGetMockData<ResponsePageUserGroupDTO> = {
  loading: false,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: (null as unknown) as undefined,
    data: {
      content: [
        { name: 'ug1', identifier: 'ug1' },
        { name: 'ug2', identifier: 'ug2' },
        { name: 'ug3', identifier: 'ug3' }
      ]
    }
  }
}
