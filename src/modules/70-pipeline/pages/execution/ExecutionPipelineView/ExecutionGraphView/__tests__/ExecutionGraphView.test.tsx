import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper, NotFound } from '@common/utils/testUtils'
import type { ExecutionNode } from 'services/cd-ng'

import type { ExecutionPipelineNode } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import type { ExecutionStageDiagramProps } from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagram'
import ExecutionContext from '@pipeline/pages/execution/ExecutionContext/ExecutionContext'
import type { ExecutionContextParams } from '@pipeline/pages/execution/ExecutionContext/ExecutionContext'
import { getPipelineStagesMap } from '@pipeline/utils/executionUtils'
import mockCD from './mock.json'
import mockCI from './mock-ci.json'
import ExecutionGraphView from '../ExecutionGraphView'
jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

function renderNode(
  data: ExecutionPipelineNode<ExecutionNode>,
  itemClickHandler: ExecutionStageDiagramProps<ExecutionNode>['itemClickHandler']
): React.ReactElement {
  const { parallel, group, item } = data

  if (parallel) {
    return (
      <div data-stage="parallel" key={parallel[0].item?.identifier}>
        {parallel.map(e => renderNode(e, itemClickHandler))}
      </div>
    )
  }
  if (group) {
    return (
      <div data-stage="group" key={group.identifier} data-group={group.name}>
        {group.items.map(e => renderNode(e, itemClickHandler))}
      </div>
    )
  }

  if (item) {
    return (
      <div
        data-item={item.identifier}
        data-status={item.status}
        key={item.identifier}
        onClick={e => {
          e.stopPropagation()
          itemClickHandler?.({ ...e, stage: item } as any)
        }}
      >
        {item?.name}
      </div>
    )
  }

  return <div data-item="empty" />
}

jest.mock('@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagram', () => {
  return function ExecutionStageDiagramMock(props: ExecutionStageDiagramProps<ExecutionNode>) {
    const { data, itemClickHandler } = props
    return <div data-testid="execution-stage-diagram-mock">{data?.items.map(e => renderNode(e, itemClickHandler))}</div>
  }
})

const contextValue = (mock: any = mockCD): ExecutionContextParams => ({
  pipelineExecutionDetail: mock.data as any,
  allNodeMap: mock.data.executionGraph.nodeMap as any,
  pipelineStagesMap: getPipelineStagesMap(
    mock.data.pipelineExecutionSummary.layoutNodeMap as any,
    mock.data.pipelineExecutionSummary.startingNodeId
  ),
  selectedStageId: 'google_1',
  selectedStepId: '',
  loading: false,
  queryParams: {},
  logsToken: 'token',
  setLogsToken: jest.fn()
})

const fetchMock = jest.spyOn(global, 'fetch' as any)
fetchMock.mockResolvedValue({
  text: () => new Promise(resolve => resolve('')),
  json: () => new Promise(resolve => resolve({})),
  headers: { get: () => 'application/json' }
})

describe('<ExecutionGraphView /> tests', () => {
  const dateToString = jest.spyOn(Date.prototype, 'toLocaleString')

  beforeAll(() => {
    dateToString.mockImplementation(() => 'DUMMY DATE')
  })

  afterAll(() => {
    dateToString.mockRestore()
  })
  test('renders execution graphs with CD data', () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue()}>
          <ExecutionGraphView />
          <NotFound />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('renders execution graphs with CI data', () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue(mockCI)}>
          <ExecutionGraphView />
          <NotFound />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('stage selection works', async () => {
    const { findByText, getByTestId } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue()}>
          <ExecutionGraphView />
          <NotFound />
        </ExecutionContext.Provider>
      </TestWrapper>
    )

    const stage = await findByText('google_1')

    fireEvent.click(stage)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /?stage=google_1
      </div>
    `)
  })

  test('stage selection does not works for "NotStarted" status', async () => {
    const { findByText, getByTestId } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue()}>
          <ExecutionGraphView />
          <NotFound />
        </ExecutionContext.Provider>
      </TestWrapper>
    )

    const stage = await findByText('qa stage')

    fireEvent.click(stage)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /
      </div>
    `)
  })

  test('step selection works', async () => {
    const { findByText, getByTestId } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue()}>
          <ExecutionGraphView />
          <NotFound />
        </ExecutionContext.Provider>
      </TestWrapper>
    )

    const step = await findByText('Rollout Deployment')

    fireEvent.click(step)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /?stage=google_1&step=K8sRollingUuid
      </div>
    `)
  })

  test('step selection does not works for "NotStarted" status', async () => {
    const { findByText, getByTestId } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue()}>
          <ExecutionGraphView />
          <NotFound />
        </ExecutionContext.Provider>
      </TestWrapper>
    )

    const step = await findByText('RolloutSecond')

    fireEvent.click(step)

    expect(getByTestId('location')).toMatchInlineSnapshot(
      `
      <div
        data-testid="location"
      >
        /
      </div>
    `
    )
  })

  test('step details are shown when step is selected', async () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionContext.Provider
          value={{
            ...contextValue(),
            queryParams: { step: 'K8sRollingUuid' },
            selectedStepId: 'K8sRollingUuid'
          }}
        >
          <ExecutionGraphView />
          <NotFound />
        </ExecutionContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
