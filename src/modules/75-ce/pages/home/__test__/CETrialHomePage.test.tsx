import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CETrialHomePage from '../CETrialHomePage'

jest.mock('services/portal', () => ({
  useStartTrial: jest.fn().mockImplementation(() => {
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
  })
}))

describe('CETrialHomePage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CETrialHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
