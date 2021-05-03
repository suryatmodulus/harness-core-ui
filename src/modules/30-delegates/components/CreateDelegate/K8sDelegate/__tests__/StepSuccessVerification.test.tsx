import React from 'react'
import { fireEvent, render, wait } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import StepSuccessVerifcation from '../StepSuccessVerification/StepSuccessVerifcation'

describe('Create Step Verification Script Delegate', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <StepSuccessVerifcation />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Click back button', async () => {
    const { container } = render(
      <TestWrapper>
        <StepSuccessVerifcation />
      </TestWrapper>
    )
    const stepReviewScriptBackButton = container?.querySelector('#stepReviewScriptBackButton')
    fireEvent.click(stepReviewScriptBackButton!)
    await wait()
    expect(container).toMatchSnapshot()
  })
})
