import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetModuleLicenseInfo } from 'services/portal'
import CIHomePage from '../CIHomePage'

jest.mock('services/portal')
const useGetModuleLicenseInfoMock = useGetModuleLicenseInfo as jest.MockedFunction<any>

describe('CIHomePage', () => {
  test('should render HomePageTemplate when return success with data', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        error: null,
        refetch: jest.fn()
      }
    })
    const { container, getByText } = render(
      <TestWrapper>
        <CIHomePage />
      </TestWrapper>
    )
    expect(getByText('ci.dashboard.subHeading')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should return error page if call fails', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: null,
        error: {
          message: 'call failed'
        },
        refetch: jest.fn()
      }
    })
    const { container, getByText } = render(
      <TestWrapper>
        <CIHomePage />
      </TestWrapper>
    )
    expect(getByText('call failed')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should move to trial in progress page when query param trial is true', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        error: null,
        refetch: jest.fn()
      }
    })
    const { container, getByText } = render(
      <TestWrapper queryParams={{ trial: true }}>
        <CIHomePage />
      </TestWrapper>
    )
    expect(getByText('common.trialInProgress')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
