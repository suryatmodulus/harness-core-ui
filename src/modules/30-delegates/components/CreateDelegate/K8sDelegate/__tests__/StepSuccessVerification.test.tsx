import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import StepSuccessVerifcation from '../StepSuccessVerification/StepSuccessVerifcation'

const onClose = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegatesHeartbeatDetails: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDelegatesInitializationDetails: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))
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
        <StepSuccessVerifcation previousStep={jest.fn()} />
      </TestWrapper>
    )
    const stepReviewScriptBackButton = container?.querySelector('#stepReviewScriptBackButton')
    act(() => {
      fireEvent.click(stepReviewScriptBackButton!)
    })
    await waitFor(() => expect(container).toMatchSnapshot())
  })
  test('Click Verify button', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <StepSuccessVerifcation />
      </TestWrapper>
    )
    const stepReviewScriptVerifyButton = getByText('verify')
    act(() => {
      fireEvent.click(stepReviewScriptVerifyButton!)
    })
    expect(container).toMatchSnapshot()
  })
  test('Click Done button', async () => {
    const { getAllByText } = render(
      <TestWrapper>
        <StepSuccessVerifcation onClose={onClose} />
      </TestWrapper>
    )
    const stepReviewScriptDoneButton = getAllByText('done')[0]
    act(() => {
      fireEvent.click(stepReviewScriptDoneButton!)
    })
    expect(onClose).toBeCalled()
  })
})
