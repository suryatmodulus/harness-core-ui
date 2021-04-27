import React from 'react'
import { act, render } from '@testing-library/react'
jest.mock('@wings-software/uicore')
import { MultiLogsViewer, MultiLogsViewerProps } from '@wings-software/uicore'
import type { ExecutionNode, GraphLayoutNode } from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, executionPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import ExecutionContext from '../../../ExecutionContext/ExecutionContext'
import type { ExecutionContextParams } from '../../../ExecutionContext/ExecutionContext'
import LogsContent from '../LogsContent'

jest.mock('@pipeline/components/PipelineSteps/PipelineStepFactory', () => ({
  getStepIcon: jest.fn()
}))

jest.mock('@wings-software/uicore', () => ({
  ...(jest.requireActual('@wings-software/uicore') as any),
  MultiLogsViewer: jest.fn()
}))

const fetchMock = jest.spyOn(global, 'fetch' as any)
fetchMock.mockResolvedValue({
  text: () => new Promise(resolve => resolve('')),
  json: () => new Promise(resolve => resolve({})),
  headers: { get: () => 'application/json' }
})

const pipelineStagesMap = new Map<string, GraphLayoutNode>()
pipelineStagesMap.set('id1', { moduleInfo: { ci: {} }, nodeIdentifier: 'id1', status: 'Success' })
pipelineStagesMap.set('id2', { moduleInfo: { ci: {} }, nodeIdentifier: 'id2', status: 'Success' })

const getAllNodeMap = (stepStatus: 'Success' | 'Running' = 'Success'): { [key: string]: ExecutionNode } => ({
  step1: { identifier: 'step1', uuid: 'step1', status: 'Success', stepType: 'plugin' },
  step2: { identifier: 'step2', uuid: 'step2', status: stepStatus, stepType: 'plugin' }
})

const getContextValue = (selectedStepId?: string, stepStatus?: 'Success' | 'Running'): ExecutionContextParams => ({
  pipelineStagesMap,
  selectedStageId: 'id2',
  selectedStepId: selectedStepId as string,
  logsToken: 'token',
  setLogsToken: jest.fn(),
  pipelineExecutionDetail: { pipelineExecutionSummary: { runSequence: 123 } },
  allNodeMap: getAllNodeMap(stepStatus),
  loading: false,
  queryParams: {},
  addNewNodeToMap: jest.fn()
})

const TEST_PATH = routes.toExecutionPipelineView({
  ...accountPathProps,
  ...pipelinePathProps,
  ...pipelineModuleParams,
  ...executionPathProps
})

describe('<LogsContent /> tests', () => {
  test('snapshot test', () => {
    ;(MultiLogsViewer as jest.Mock).mockImplementation((_props: any) => <div />)

    const { container, rerender } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'accId',
          orgIdentifier: 'otgId',
          projectIdentifier: 'projectId',
          pipelineIdentifier: 'pipelineId',
          executionIdentifier: 'execId',
          module: 'ci'
        }}
      >
        <ExecutionContext.Provider value={getContextValue()}>
          <LogsContent />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    rerender(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'accId',
          orgIdentifier: 'otgId',
          projectIdentifier: 'projectId',
          pipelineIdentifier: 'pipelineId',
          executionIdentifier: 'execId',
          module: 'ci'
        }}
      >
        <ExecutionContext.Provider value={getContextValue('step1')}>
          <LogsContent />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    rerender(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'accId',
          orgIdentifier: 'otgId',
          projectIdentifier: 'projectId',
          pipelineIdentifier: 'pipelineId',
          executionIdentifier: 'execId',
          module: 'ci'
        }}
      >
        <ExecutionContext.Provider value={getContextValue('step2')}>
          <LogsContent />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    rerender(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'accId',
          orgIdentifier: 'otgId',
          projectIdentifier: 'projectId',
          pipelineIdentifier: 'pipelineId',
          executionIdentifier: 'execId',
          module: 'ci'
        }}
      >
        <ExecutionContext.Provider value={getContextValue('step2', 'Running')}>
          <LogsContent />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('toggleSection, rightElementForSection callback props works properly', async () => {
    ;(MultiLogsViewer as jest.Mock).mockImplementation((props: Partial<MultiLogsViewerProps>) => (
      <>
        <div onClick={() => props.toggleSection?.(1)}>toggleSection</div>
        <div onClick={() => props.rightElementForSection?.(1)}>rightElementForSection</div>
      </>
    ))

    const { container, findByText } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'accId',
          orgIdentifier: 'otgId',
          projectIdentifier: 'projectId',
          pipelineIdentifier: 'pipelineId',
          executionIdentifier: 'execId',
          module: 'ci'
        }}
      >
        <ExecutionContext.Provider value={getContextValue()}>
          <LogsContent />
        </ExecutionContext.Provider>
      </TestWrapper>
    )

    await act(async () => {
      const btn = await findByText('toggleSection')
      btn.click()
    })

    expect(container).toMatchSnapshot()

    await act(async () => {
      const btn = await findByText('rightElementForSection')
      btn.click()
    })

    expect(container).toMatchSnapshot()
  })
})
