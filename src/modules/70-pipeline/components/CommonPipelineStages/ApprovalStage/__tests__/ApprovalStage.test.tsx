import React from 'react'
import type { UseGetReturn } from 'restful-react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as services from 'services/pipeline-ng'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { ApprovalStageSetupShellMode } from '../ApprovalStageSetupShellMode'
import { ApprovalStage } from '../ApprovalStage'
import {
  getDummyPipelineContextValue,
  getDummyPipelineContextValueJiraApproval,
  getPropsForMinimalStage,
  mockYamlSnippetResponse
} from './ApprovalStageTestsHelper'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  }),
  noop: jest.fn()
}))

jest.mock('resize-observer-polyfill', () => {
  class ResizeObserver {
    static default = ResizeObserver
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    observe() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    unobserve() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    disconnect() {
      // do nothing
    }
  }
  return ResizeObserver
})

describe('Approval Stage minimal view', () => {
  test('Basic render, selection and setup stage', async () => {
    const props = getPropsForMinimalStage()
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <ApprovalStage
          minimal={true}
          stageProps={props.stageProps as any}
          name={''}
          type={''}
          icon={'nav-harness'}
          isDisabled={false}
          isApproval={true}
          title="My approval stage"
          description={''}
        />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })
    await waitFor(() => queryByText('approvalStage.stageNameRequired'))

    const nameInput = container.querySelector('.bp3-input')
    act(() => {
      fireEvent.change(nameInput!, { target: { value: 'stagename' } })
    })
    expect(props.stageProps?.onChange).toBeCalledTimes(4)
    expect(props.stageProps?.onChange).toBeCalledWith({
      name: 'stagename',
      identifier: 'stagename',
      description: undefined,
      approvalType: 'HarnessApproval',
      tags: {}
    })
    act(() => {
      fireEvent.click(getByText('Harness Approval'))
    })

    act(() => {
      fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })
    await waitFor(() =>
      expect(props.stageProps?.onSubmit).toBeCalledWith(
        {
          stage: {
            name: 'stagename',
            identifier: 'stagename',
            description: undefined,
            approvalType: 'HarnessApproval',
            tags: {}
          }
        },
        'stagename'
      )
    )
  })
})

describe('Jira Approval Stage minimal view', () => {
  test('Basic render, selection and setup stage', async () => {
    const props = getPropsForMinimalStage()
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <ApprovalStage
          minimal={true}
          stageProps={props.stageProps as any}
          name={''}
          type={''}
          icon={'service-jira'}
          isDisabled={false}
          isApproval={true}
          title="My approval stage"
          description={''}
        />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })
    await waitFor(() => queryByText('approvalStage.stageNameRequired'))

    const nameInput = container.querySelector('.bp3-input')
    act(() => {
      fireEvent.change(nameInput!, { target: { value: 'stagename' } })
    })
    expect(props.stageProps?.onChange).toBeCalledTimes(4)
    act(() => {
      fireEvent.click(getByText('Jira'))
    })
    expect(props.stageProps?.onChange).toBeCalledWith({
      name: 'stagename',
      identifier: 'stagename',
      description: undefined,
      approvalType: 'JiraApproval',
      tags: {}
    })

    act(() => {
      fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })
    await waitFor(() =>
      expect(props.stageProps?.onSubmit).toBeCalledWith(
        {
          stage: {
            name: 'stagename',
            identifier: 'stagename',
            description: undefined,
            approvalType: 'JiraApproval',
            tags: {}
          }
        },
        'stagename'
      )
    )
  })
})

describe('Approval Stage shell view', () => {
  beforeEach(() => {
    jest
      .spyOn(services, 'useGetInitialStageYamlSnippet')
      .mockReturnValue(mockYamlSnippetResponse as UseGetReturn<any, services.Failure, any, unknown>)
  })
  test('Setup shell view tests', async () => {
    const pipelineContextMockValue = getDummyPipelineContextValue()
    const { container, getByDisplayValue, getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <ApprovalStageSetupShellMode />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('overview'))
    })
    act(() => {
      fireEvent.change(getByDisplayValue('ApprovalStep'), { target: { value: 'changedstagename' } })
    })

    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())

    // const skipCoditionInputInOverview = container.querySelector('[name="skipCondition"]')
    // act(() => {
    //   fireEvent.change(skipCoditionInputInOverview!, { target: { value: 'randomskipcondition' } })
    // })
    // await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())

    // Move to next tab
    act(() => {
      fireEvent.click(getByText('next'))
    })
    expect(pipelineContextMockValue.updatePipeline).toBeCalled()
    const nodeStart = container.querySelector('.nodeStart')
    expect(nodeStart).toBeTruthy()

    // Switch back to first tab
    act(() => {
      fireEvent.click(getByText('overview'))
    })
    expect(pipelineContextMockValue.updatePipeline).toBeCalled()
    // expect(
    //   queryByText(
    //     /In the JEXL Expression, you could use any of the pipeline variables - including the output of any previous stages./
    //   )
    // ).toBeTruthy()

    // Open failure strategy panel
    // act(() => {
    //   fireEvent.click(getByText('pipeline.failureStrategies.title'))
    // })
    // expect(pipelineContextMockValue.updatePipelineView).toBeCalledWith({
    //   isSplitViewOpen: true,
    //   isDrawerOpened: true,
    //   splitViewData: { type: 'StageView' },
    //   drawerData: { type: 'FailureStrategy' }
    // })

    // Open the skip conditions panel (next to failure strategy)
    // act(() => {
    //   fireEvent.click(getAllByText('skipConditionTitle')[0])
    // })
    // expect(pipelineContextMockValue.updatePipelineView).toBeCalledWith({
    //   isSplitViewOpen: true,
    //   isDrawerOpened: true,
    //   splitViewData: { type: 'StageView' },
    //   drawerData: { type: 'FailureStrategy' }
    // })
  })
})

describe('Jira Approval Stage shell view', () => {
  beforeEach(() => {
    jest
      .spyOn(services, 'useGetInitialStageYamlSnippet')
      .mockReturnValue(mockYamlSnippetResponse as UseGetReturn<any, services.Failure, any, unknown>)
  })
  test('Setup shell view tests', async () => {
    const pipelineContextMockValue = getDummyPipelineContextValueJiraApproval()
    const { container, getByDisplayValue, getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <ApprovalStageSetupShellMode />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('overview'))
    })
    act(() => {
      fireEvent.change(getByDisplayValue('ApprovalStep'), { target: { value: 'changedstagename' } })
    })

    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())

    // const skipCoditionInputInOverview = container.querySelector('[name="skipCondition"]')
    // act(() => {
    //   fireEvent.change(skipCoditionInputInOverview!, { target: { value: 'randomskipcondition' } })
    // })
    // await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())

    // Move to next tab
    act(() => {
      fireEvent.click(getByText('next'))
    })
    expect(pipelineContextMockValue.updatePipeline).toBeCalled()
    const nodeStart = container.querySelector('.nodeStart')
    expect(nodeStart).toBeTruthy()

    // Switch back to first tab
    act(() => {
      fireEvent.click(getByText('overview'))
    })
    expect(pipelineContextMockValue.updatePipeline).toBeCalled()
    // expect(
    //   queryByText(
    //     /In the JEXL Expression, you could use any of the pipeline variables - including the output of any previous stages./
    //   )
    // ).toBeTruthy()

    // Open failure strategy panel
    // act(() => {
    //   fireEvent.click(getByText('pipeline.failureStrategies.title'))
    // })
    // expect(pipelineContextMockValue.updatePipelineView).toBeCalledWith({
    //   isSplitViewOpen: true,
    //   isDrawerOpened: true,
    //   splitViewData: { type: 'StageView' },
    //   drawerData: { type: 'FailureStrategy' }
    // })

    // Open the skip conditions panel (next to failure strategy)
    // act(() => {
    //   fireEvent.click(getAllByText('Skip Condition')[0])
    // })
    // expect(pipelineContextMockValue.updatePipelineView).toBeCalledWith({
    //   isSplitViewOpen: true,
    //   isDrawerOpened: true,
    //   splitViewData: { type: 'StageView' },
    //   drawerData: { type: 'FailureStrategy' }
    // })
  })
})

describe('Approval Stage readonly view', () => {
  beforeEach(() => {
    jest
      .spyOn(services, 'useGetInitialStageYamlSnippet')
      .mockReturnValue(mockYamlSnippetResponse as UseGetReturn<any, services.Failure, any, unknown>)
  })

  test('if readonly view works', async () => {
    const pipelineContextMockValue = getDummyPipelineContextValue()
    const { container, getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={{ ...pipelineContextMockValue, isReadonly: true }}>
          <ApprovalStageSetupShellMode />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('overview'))
    })

    expect(container).toMatchSnapshot('readonly view apprvoal step overview')
  })
})
