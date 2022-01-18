/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
