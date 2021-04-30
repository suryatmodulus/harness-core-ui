import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useStartTrial } from 'services/portal'
import { StartTrialTemplate } from '../StartTrialTemplate'

jest.mock('services/portal')
const useStartTrialMock = useStartTrial as jest.MockedFunction<any>

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
  test('should render start a trial by default', async () => {
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

  test('should display error msg when api call fails', async () => {
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
