/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import StepSuccessVerifcation from '../StepSuccessVerification/StepSuccessVerifcation'

const onClose = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegatesHeartbeatDetailsV2: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDelegatesInitializationDetailsV2: jest.fn().mockImplementation(() => {
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
