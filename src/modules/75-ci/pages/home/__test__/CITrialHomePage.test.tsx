import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CITrialHomePage from '../CITrialHomePage'

jest.mock('services/cd-ng', () => ({
  useStartTrialLicense: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: jest.fn().mockImplementationOnce(() => {
        return {
          status: 'SUCCESS',
          data: {
            licenseType: 'TRIAL'
          }
        }
      })
    }
  }),
  useStartFreeLicense: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: jest.fn().mockImplementationOnce(() => {
        return {
          status: 'SUCCESS',
          data: {
            licenseType: 'FREE'
          }
        }
      })
    }
  })
}))

describe('CITrialHomePage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper>
        <CITrialHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should call button event when click', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CITrialHomePage />
      </TestWrapper>
    )
    fireEvent.click(getByText('ci.ciTrialHomePage.startTrial.startBtn.description'))
    await waitFor(() => expect(container).toMatchSnapshot())
  })
})
