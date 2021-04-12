import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper, NotFound } from '@common/utils/testUtils'
import { getPipelineStagesMap } from '@pipeline/utils/executionUtils'
import ExecutionContext from '../../../ExecutionContext/ExecutionContext'
import ExecutionLogView from '../ExecutionLogView'
import type { ExecutionContextParams } from '../../../ExecutionContext/ExecutionContext'
import mock from '../../ExecutionGraphView/__tests__/mock.json'

jest.mock('@pipeline/components/PipelineSteps/PipelineStepFactory', () => ({
  getStepIcon: jest.fn()
}))

const contextValue: ExecutionContextParams = {
  pipelineExecutionDetail: mock.data as any,
  allNodeMap: mock.data.executionGraph.nodeMap as any,
  pipelineStagesMap: getPipelineStagesMap(
    mock.data.pipelineExecutionSummary.layoutNodeMap as any,
    mock.data.pipelineExecutionSummary.startingNodeId
  ),
  selectedStageId: 'google_1',
  selectedStepId: '',
  queryParams: {},
  loading: false,
  logsToken: 'token',
  setLogsToken: jest.fn(),
  addNewNodeToMap: jest.fn()
}

const fetchMock = jest.spyOn(global, 'fetch' as any)
fetchMock.mockResolvedValue({
  text: () => new Promise(resolve => resolve('')),
  json: () => new Promise(resolve => resolve({})),
  headers: { get: () => 'application/json' }
})

describe('<ExecutionLogView /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue}>
          <ExecutionLogView />
          <NotFound />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('stage selection works', async () => {
    const { findByText, getByTestId } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue}>
          <ExecutionLogView />
          <NotFound />
        </ExecutionContext.Provider>
      </TestWrapper>
    )

    const stageBtn = await findByText('google_1')

    fireEvent.click(stageBtn!)

    const stage = await findByText('google_2')

    fireEvent.click(stage)

    expect(getByTestId('location').innerHTML).toContain('stage=google_2')
  })
})
