import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CITrialHomePage from '../CITrialHomePage'

describe('CITrialHomePage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CITrialHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should call button event when click', async () => {
    const { container, getByText } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CITrialHomePage />
      </TestWrapper>
    )
    fireEvent.click(getByText('ci.ciTrialHomePage.startTrial.startBtn.description'))
    await waitFor(() => expect(container).toMatchSnapshot())
  })
})
