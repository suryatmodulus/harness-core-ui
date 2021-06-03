import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useStartTrialLicense } from 'services/cd-ng'
import useStartTrialModal from '@common/modals/StartTrial/StartTrialModal'
import { StartTrialTemplate } from '../StartTrialTemplate'

jest.mock('services/cd-ng')
const useStartTrialMock = useStartTrialLicense as jest.MockedFunction<any>

jest.mock('@common/modals/StartTrial/StartTrialModal')
const useStartTrialModalMock = useStartTrialModal as jest.MockedFunction<any>

const props = {
  title: 'Continuous Integration',
  bgImageUrl: '',
  startTrialProps: {
    description: 'start trial description',
    learnMore: {
      description: 'learn more description',
      url: ''
    },
    startBtn: {
      description: 'Start A Trial'
    }
  },
  module: 'ci' as Module
}
describe('StartTrialTemplate snapshot test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should render start a trial by default', async () => {
    useStartTrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))
    useStartTrialMock.mockImplementation(() => {
      return {
        cancel: jest.fn(),
        loading: false,
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS',
            data: {
              licenseType: 'TRIAL'
            }
          }
        })
      }
    })
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <StartTrialTemplate {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should call start trial api when click Start Trial', async () => {
    useStartTrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))
    useStartTrialMock.mockImplementation(() => {
      return {
        cancel: jest.fn(),
        loading: false,
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS',
            data: {
              licenseType: 'TRIAL'
            }
          }
        })
      }
    })
    const { container, getByText } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <StartTrialTemplate {...props} />
      </TestWrapper>
    )
    fireEvent.click(getByText('Start A Trial'))
    await waitFor(() => expect(useStartTrialMock).toBeCalled())
    expect(container).toMatchSnapshot()
  })

  test('should open the modal when a button is clicked and shouldShowStartTrialModal is true', async () => {
    const showModalMock = jest.fn()
    useStartTrialModalMock.mockImplementation(() => ({ showModal: showModalMock, hideModal: jest.fn() }))

    useStartTrialMock.mockImplementation(() => {
      return {
        cancel: jest.fn(),
        loading: false,
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS',
            data: {
              licenseType: 'TRIAL'
            }
          }
        })
      }
    })

    const customProps = {
      title: 'Continuous Integration',
      bgImageUrl: '',
      startTrialProps: {
        description: 'start trial description',
        learnMore: {
          description: 'learn more description',
          url: ''
        },
        startBtn: {
          description: 'Start A Trial'
        },
        shouldShowStartTrialModal: true
      },
      module: 'ci' as Module,
      shouldShowStartTrialModal: true
    }

    const { container, getByText } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <StartTrialTemplate {...customProps} />
      </TestWrapper>
    )
    fireEvent.click(getByText('Start A Trial'))
    await waitFor(() => expect(showModalMock).toHaveBeenCalled())
    expect(container).toMatchSnapshot()
  })

  test('should call the start button click handler if it exists', async () => {
    const showModalMock = jest.fn()
    useStartTrialModalMock.mockImplementation(() => ({ showModal: showModalMock, hideModal: jest.fn() }))

    useStartTrialMock.mockImplementation(() => {
      return {
        cancel: jest.fn(),
        loading: false,
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS',
            data: {
              licenseType: 'TRIAL'
            }
          }
        })
      }
    })

    const startBtnClickHandlerMock = jest.fn()

    const customProps = {
      title: 'Continuous Integration',
      bgImageUrl: '',
      startTrialProps: {
        description: 'start trial description',
        learnMore: {
          description: 'learn more description',
          url: ''
        },
        startBtn: {
          description: 'Start A Trial',
          onClick: startBtnClickHandlerMock
        }
      },
      module: 'ci' as Module,
      shouldShowStartTrialModal: true
    }

    const { container, getByText } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <StartTrialTemplate {...customProps} />
      </TestWrapper>
    )
    fireEvent.click(getByText('Start A Trial'))
    await waitFor(() => expect(startBtnClickHandlerMock).toHaveBeenCalled())
    expect(container).toMatchSnapshot()
  })

  test('should display error msg when api call fails', async () => {
    useStartTrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))
    useStartTrialMock.mockImplementation(() => {
      return {
        mutate: jest.fn().mockRejectedValue({
          data: {
            message: 'start trial failed'
          }
        })
      }
    })
    const { container, getByText } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <StartTrialTemplate {...props} />
      </TestWrapper>
    )
    fireEvent.click(getByText('Start A Trial'))
    await waitFor(() => expect(getByText('start trial failed')).toBeDefined())
    expect(container).toMatchSnapshot()
  })
})
