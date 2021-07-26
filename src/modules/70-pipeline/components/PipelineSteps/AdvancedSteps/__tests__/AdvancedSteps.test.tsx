import React from 'react'
import { render, act } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import type { StepFormikRef } from '@pipeline/components/AbstractSteps/Step'

import { AdvancedStepsWithRef } from '../AdvancedSteps'

jest.mock('@common/components/MonacoEditor/MonacoEditor')

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  }),
  useGetDelegateSelectors: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  })
}))

describe('<AdvancedSteps /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <AdvancedStepsWithRef
          isStepGroup={false}
          isReadonly={false}
          step={{} as any}
          stepsFactory={{ getStep: jest.fn(() => ({ hasDelegateSelectionVisible: true })) } as any}
          onChange={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  // this test can be removed if we remove obSubmit handler
  test('submit works', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onSubmit = jest.fn()

    render(
      <TestWrapper>
        <AdvancedStepsWithRef
          isStepGroup={false}
          step={{} as any}
          isReadonly={false}
          stepsFactory={{ getStep: jest.fn() } as any}
          ref={ref}
          onChange={onSubmit}
        />
      </TestWrapper>
    )

    await act(() => ref.current?.submitForm())

    expect(onSubmit).toHaveBeenCalledWith({
      delegateSelectors: [],
      failureStrategies: [],
      when: undefined,
      tab: 'ADVANCED'
    })
  })
})
