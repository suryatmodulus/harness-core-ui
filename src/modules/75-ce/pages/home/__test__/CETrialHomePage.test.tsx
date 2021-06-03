import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useStartTrialLicense } from 'services/cd-ng'
import useStartTrialModal from '@common/modals/StartTrial/StartTrialModal'
import CETrialHomePage from '../CETrialHomePage'

jest.mock('services/cd-ng')
const useStartTrialMock = useStartTrialLicense as jest.MockedFunction<any>

jest.mock('@common/modals/StartTrial/StartTrialModal')
const useStartTrialModalMock = useStartTrialModal as jest.MockedFunction<any>

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
    useStartTrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CETrialHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('it should show a loading spinner', async () => {
    useStartTrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CETrialHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('it open the modal on render when the source is singup', async () => {
    const showModalMock = jest.fn()
    useStartTrialModalMock.mockImplementation(() => ({ showModal: showModalMock, hideModal: jest.fn() }))

    render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }} queryParams={{ source: 'signup' }}>
        <CETrialHomePage />
      </TestWrapper>
    )
    expect(showModalMock).toHaveBeenCalled
  })
})
