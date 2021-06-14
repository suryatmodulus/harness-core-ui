import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CFTrialHomePage from '../CFTrialHomePage'

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
  })
}))

describe('CFTrialHomePage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CFTrialHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
