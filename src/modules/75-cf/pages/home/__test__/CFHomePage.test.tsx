import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetModuleLicenseByAccountAndModuleType } from 'services/cd-ng'
import CFHomePage from '../CFHomePage'

jest.mock('services/cd-ng')
const useGetModuleLicenseInfoMock = useGetModuleLicenseByAccountAndModuleType as jest.MockedFunction<any>

const currentUser = {
  defaultAccountId: '123',
  accounts: [
    {
      uuid: '123',
      createdFromNG: true
    }
  ]
}

describe('CFHomePage', () => {
  test('should render HomePageTemplate when return success with data', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <CFHomePage />
      </TestWrapper>
    )
    expect(getByText('cf.homepage.slogan')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should render the home page template when the current user is not created from NG', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const userCreatedFromCG = {
      defaultAccountId: '123',
      accounts: [
        {
          uuid: '123',
          createdFromNG: false
        }
      ]
    }

    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: userCreatedFromCG }}>
        <CFHomePage />
      </TestWrapper>
    )
    expect(getByText('cf.homepage.slogan')).toBeDefined()
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
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <CFHomePage />
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
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }} queryParams={{ trial: true }}>
        <CFHomePage />
      </TestWrapper>
    )
    expect(getByText('common.trialInProgress')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should render HomePageTemplate when return success with data', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <CFHomePage />
      </TestWrapper>
    )
    expect(getByText('cf.homepage.slogan')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
