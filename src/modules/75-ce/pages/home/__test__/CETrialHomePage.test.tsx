import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useStartTrialLicense } from 'services/cd-ng'
import CETrialHomePage from '../CETrialHomePage'

jest.mock('services/cd-ng')
const useStartTrialMock = useStartTrialLicense as jest.MockedFunction<any>

describe('CETrialHomePage snapshot test', () => {
  beforeEach(() => {
    useStartTrialMock.mockImplementation(() => {
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
  })

  test('it should render properly', async () => {
    const { container } = render(
      <TestWrapper>
        <CETrialHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
