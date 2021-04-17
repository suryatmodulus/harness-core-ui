import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { RightDrawer } from '../RightDrawer'
import { DrawerTypes } from '../../PipelineContext/PipelineActions'

jest.mock('framework/exports', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...(jest.requireActual('framework/exports') as object),
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
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...(jest.requireActual('../../PiplineHooks/useVariablesExpression') as object),
  useVariablesExpression: jest.fn().mockReturnValue({
    expressions: ['']
  })
}))

describe('Right Drawer tests', () => {
  let useContextMock
  const updatePipelineSpy = jest.fn()
  const updatePipelineViewSpy = jest.fn()
  const getStageFromPipelineSpy = jest.fn().mockReturnValue({
    stage: {
      stage: {
        skipCondition: '',
        stageName: 'stageName',
        name: 'stageName'
      }
    }
  })
  beforeEach(() => {
    useContextMock = jest.fn().mockReturnValue({
      state: {
        pipeline: {},
        pipelineView: {
          drawerData: {
            type: DrawerTypes.SkipCondition,
            data: {}
          },
          isDrawerOpened: true,
          splitViewData: { selectedStageId: 'selectedStageId', stageType: 'DEPLOYMENT' }
        }
      },
      updatePipeline: updatePipelineSpy,
      updatePipelineView: updatePipelineViewSpy,
      getStageFromPipeline: getStageFromPipelineSpy,
      stepsFactory: {}
    })
    React.useContext = useContextMock
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Basic snapshot - Skip Condition drawer', async () => {
    const { queryByText, container, getByText } = render(
      <TestWrapper>
        <RightDrawer />
      </TestWrapper>
    )
    expect(queryByText('stageName / skipConditionTitle')).toBeTruthy()

    const input = container.querySelector('input[name="skipCondition"]')
    fireEvent.change(input!, { target: { value: ' changedcondition ' } })

    fireEvent.click(getByText('submit'))
    await waitFor(() => {
      expect(getStageFromPipelineSpy).toBeCalledWith('selectedStageId')
      expect(updatePipelineSpy).toBeCalledWith({})
      expect(updatePipelineViewSpy).toBeCalledWith({
        drawerData: {
          type: 'ConfigureService'
        },
        isDrawerOpened: false,
        splitViewData: {
          selectedStageId: 'selectedStageId',
          stageType: 'DEPLOYMENT'
        }
      })
    })
  })
})
