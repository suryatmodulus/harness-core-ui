import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
// import { useStartTrialLicense } from 'services/cd-ng'
// import useStartTrialModal from '@common/modals/StartTrial/StartTrialModal'
import { ModuleName } from 'framework/types/ModuleName'
import CETrialHomePage from '../CETrialHomePage'

// jest.mock('services/cd-ng')
// const useStartTrialMock = useStartTrialLicense as jest.MockedFunction<any>

// jest.mock('@common/modals/StartTrial/StartTrialModal')
// const useStartTrialModalMock = useStartTrialModal as jest.MockedFunction<any>

const trialBannerProps = {
  expiryTime: 0,
  licenseType: undefined,
  module: ModuleName.CE,
  refetch: jest.fn()
}

describe('CETrialHomePage snapshot test', () => {
  // beforeEach(() => {
  //   useStartTrialMock.mockImplementation(() => {
  //     return {
  //       cancel: jest.fn(),
  //       loading: false,
  //       mutate: jest.fn().mockImplementationOnce(() => {
  //         return {
  //           status: 'SUCCESS',
  //           data: {
  //             licenseType: 'TRIAL'
  //           }
  //         }
  //       })
  //     }
  //   })
  // })

  test('it should render properly', async () => {
    // useStartTrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CETrialHomePage trialBannerProps={trialBannerProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
