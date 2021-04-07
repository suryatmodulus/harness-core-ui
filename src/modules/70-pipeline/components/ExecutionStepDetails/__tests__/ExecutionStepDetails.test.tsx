import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import ExecutionContext, { ExecutionContextParams } from '@pipeline/pages/execution/ExecutionContext/ExecutionContext'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import { useGetApprovalInstance } from 'services/pipeline-ng'
import ExecutionStepDetails, { ExecutionStepDetailsProps } from '../ExecutionStepDetails'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => () => null)
jest.mock('services/pipeline-ng', () => ({
  useGetApprovalInstance: jest.fn(() => ({ data: {}, loading: false })),
  useGetHarnessApprovalInstanceAuthorization: jest.fn(() => ({ data: {}, loading: false })),
  useAddHarnessApprovalActivity: jest.fn(() => ({ mutate: jest.fn() }))
}))

const TEST_PATH = routes.toExecutionPipelineView({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})

const pathParams = {
  accountId: 'TEST_ACCOUNT_ID',
  orgIdentifier: 'TEST_ORG',
  projectIdentifier: 'TEST_PROJECT',
  pipelineIdentifier: 'TEST_PIPELINE',
  executionIdentifier: 'TEST_EXECUTION',
  module: 'cd',
  stageId: 'selectedStageId'
}

const executionContext: ExecutionContextParams = {
  pipelineExecutionDetail: null,
  allNodeMap: {
    normalStep: {
      stepType: 'ShellScript',
      status: 'Success'
    },
    approvalStepWaiting: {
      stepType: 'HarnessApproval',
      status: 'Waiting'
    },
    approvalStepComplete: {
      stepType: 'JiraApproval',
      status: 'Failed'
    },
    errorStep: {
      name: 'Rollout Deployment',
      identifier: 'rolloutDeployment',
      outcomes: [],
      stepType: 'K8sRollingDeploy',
      status: 'Failed',
      failureInfo: { errorMessage: 'Failed to complete K8s task. Please check execution logs.' },
      nodeRunInfo: { whenCondition: '<+OnStageSuccess>', evaluatedCondition: true },
      delegateInfoList: [
        {
          id: 'kZPIujTnSgO0Yz04OztwiQ',
          name: 'Kapil-Kumawat-MBP-2019.local',
          taskId: 'SKGvcBFRQCe2xKPPtx8i4Q',
          taskName: 'Git Fetch Files Task / test'
        },
        {
          id: 'kZPIujTnSgO0Yz04OztwiQ',
          name: 'Kapil-Kumawat-MBP-2019.local',
          taskId: 'J5L7EeGTQTC96-91Py6YIQ',
          taskName: 'K8s Task : Rolling Deploy'
        }
      ]
    }
  },
  pipelineStagesMap: new Map(),
  selectedStageId: '',
  selectedStepId: '',
  loading: false,
  queryParams: {},
  logsToken: 'logsToken',
  setLogsToken: jest.fn(),
  refetch: jest.fn()
}

function TestComponent(props: ExecutionStepDetailsProps): React.ReactElement {
  return (
    <TestWrapper path={TEST_PATH} pathParams={pathParams}>
      <ExecutionContext.Provider value={executionContext}>
        <ExecutionStepDetails {...props} />
      </ExecutionContext.Provider>
    </TestWrapper>
  )
}

describe('<ExecutionStepDetails /> tests', () => {
  test('renders normal step', () => {
    const { container } = render(<TestComponent selectedStep="normalStep" closeDetails={jest.fn()} />)
    expect(container).toMatchSnapshot()
  })

  test('renders approval waiting step', () => {
    const { container } = render(<TestComponent selectedStep="approvalStepWaiting" closeDetails={jest.fn()} />)
    expect(container).toMatchSnapshot()
  })

  test('renders approval complete step', () => {
    const { container } = render(<TestComponent selectedStep="approvalStepComplete" closeDetails={jest.fn()} />)
    expect(container).toMatchSnapshot()
  })
  test('renders normal error step', () => {
    const { container } = render(<TestComponent selectedStep="errorStep" closeDetails={jest.fn()} />)
    expect(container).toMatchSnapshot()
  })

  test('click on refresh triggers new approval call', async () => {
    const refetch = jest.fn()
    ;(useGetApprovalInstance as jest.Mock).mockImplementation(() => ({ data: {}, loading: false, refetch }))

    const { container, findByText } = render(
      <TestComponent selectedStep="approvalStepWaiting" closeDetails={jest.fn()} />
    )
    expect(container).toMatchSnapshot()

    const refresh = await findByText('Refresh')

    fireEvent.click(refresh)

    await waitFor(() => expect(refetch).toHaveBeenCalled())
  })
})
