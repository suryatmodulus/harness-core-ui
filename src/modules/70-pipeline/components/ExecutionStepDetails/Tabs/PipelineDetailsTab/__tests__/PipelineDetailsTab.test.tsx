import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import ExecutionContext from '@pipeline/context/ExecutionContext'

import data from './data.json'
import { PipelineDetailsTab } from '../PipelineDetailsTab'

jest.mock('moment', () => () => ({ fromNow: () => 'DUMMY_RELATIVE_TIME' }))

describe('<PipelineDetailsTab /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionContext.Provider
          value={
            {
              pipelineStagesMap: new Map(data as any),
              queryParams: {
                stage: 'pPx_FvRDSFC2J-b1MWcHHg',
                step: 'h6CZ2dT6SZ-O1CR52U7SeA'
              }
            } as any
          }
        >
          <PipelineDetailsTab />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('empty data', () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionContext.Provider
          value={
            {
              pipelineStagesMap: new Map(),
              queryParams: {
                stage: 'pPx_FvRDSFC2J-b1MWcHHg',
                step: 'h6CZ2dT6SZ-O1CR52U7SeA'
              }
            } as any
          }
        >
          <PipelineDetailsTab />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
