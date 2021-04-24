import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { RightDrawer } from '../RightDrawer'
import { DrawerTypes, PipelineViewData, SplitViewTypes } from '../../PipelineContext/PipelineActions'
import { PipelineContext } from '../../PipelineContext/PipelineContext'
import { getDummyPipelineContextValue } from './RightDrawerTestHelper'

jest.mock('framework/exports', () => ({
  ...(jest.requireActual('framework/exports') as any),
  useStrings: jest.fn().mockReturnValue({
    getString: jest.fn().mockImplementation(val => val)
  }),
  loggerFor: jest.fn().mockReturnValue({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  })
}))

jest.mock('../../PiplineHooks/useVariablesExpression', () => ({
  ...(jest.requireActual('../../PiplineHooks/useVariablesExpression') as any),
  useVariablesExpression: jest.fn().mockReturnValue({
    expressions: ['']
  })
}))

describe('Right Drawer tests', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test('Basic snapshot - Skip Condition drawer', async () => {
    const skipConditionPipelineView: PipelineViewData = {
      isSplitViewOpen: false,
      isDrawerOpened: true,
      splitViewData: {
        type: SplitViewTypes.StageView
      },
      drawerData: { type: DrawerTypes.SkipCondition }
    }
    const pipelineContextMockValue = getDummyPipelineContextValue(skipConditionPipelineView, {
      selectedStageId: 'ApprovalStageId'
    })
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <RightDrawer />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    // Todo fix this test as it's incomplete
    expect(container).toMatchSnapshot()
  })

  test('Basic snapshot - Failure Strategy drawer', async () => {
    const skipConditionPipelineView: PipelineViewData = {
      isSplitViewOpen: false,
      isDrawerOpened: true,
      splitViewData: {
        type: SplitViewTypes.StageView
      },
      drawerData: { type: DrawerTypes.FailureStrategy }
    }
    const pipelineContextMockValue = getDummyPipelineContextValue(skipConditionPipelineView, {
      selectedStageId: 'ApprovalStageId'
    })
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <RightDrawer />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    // Todo fix this test as it's incomplete
    expect(container).toMatchSnapshot()
  })
})
