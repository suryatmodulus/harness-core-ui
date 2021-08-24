import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  useGetLicensesAndSummary,
  useStartTrialLicense,
  useGetProjectList,
  useExtendTrialLicense,
  useSaveFeedback
} from 'services/cd-ng'
import CDHomePage from '../CDHomePage'

const projects = [
  {
    project: {
      accountIdentifier: 'dummy',
      orgIdentifier: 'default',
      identifier: 'TestCiproject',
      name: 'project1',
      color: '#0063F7',
      modules: ['CI', 'CD'],
      description: '',
      tags: {},
      lastModifiedAt: 1607348985778
    }
  },
  {
    project: {
      accountIdentifier: 'dummy',
      orgIdentifier: 'default',
      identifier: 'test11',
      name: 'project2',
      color: '#0063F7',
      modules: ['CD'],
      description: '',
      tags: {},
      lastModifiedAt: 1607075878518
    }
  }
]

jest.mock('services/cd-ng')
const useGetModuleLicenseInfoMock = useGetLicensesAndSummary as jest.MockedFunction<any>
const useStartTrialMock = useStartTrialLicense as jest.MockedFunction<any>
const useGetProjectListMock = useGetProjectList as jest.MockedFunction<any>
useGetProjectListMock.mockImplementation(() => {
  return { data: { data: { content: projects } }, refetch: jest.fn(), error: null }
})
const useExtendTrialLicenseMock = useExtendTrialLicense as jest.MockedFunction<any>
useExtendTrialLicenseMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})
const useSaveFeedbackMock = useSaveFeedback as jest.MockedFunction<any>
useSaveFeedbackMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})

const currentUser = {
  defaultAccountId: '123',
  accounts: [
    {
      uuid: '123',
      createdFromNG: true
    }
  ]
}

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineList: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      mutate: jest.fn().mockImplementationOnce(() => {
        return {
          data: {
            content: [
              {
                identifier: 'item 1'
              },
              {
                identifier: 'item 2'
              }
            ],
            empty: false
          }
        }
      })
    }
  })
}))

describe('CDHomePage snapshot test', () => {
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
        <CDHomePage />
      </TestWrapper>
    )
    expect(getByText('cd.dashboard.subHeading')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should render Trial Home page when return success with NO data', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: null,
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })
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
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <CDHomePage />
      </TestWrapper>
    )
    expect(getByText('cd.cdTrialHomePage.startTrial.description')).toBeDefined()
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
        <CDHomePage />
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
      <TestWrapper queryParams={{ trial: true }} defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <CDHomePage />
      </TestWrapper>
    )
    expect(getByText('common.trialInProgress')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should pop up select project CD Trial modal if query param modal is true and there is NOT selected project', () => {
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
      <TestWrapper queryParams={{ modal: true }}>
        <CDHomePage />
      </TestWrapper>
    )
    expect(getByText('projectsOrgs.selectAnExistingProject')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should show a loading spinner', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {},
        loading: true,
        error: null,
        refetch: jest.fn()
      }
    })
    const { container } = render(
      <TestWrapper queryParams={{ trial: true }}>
        <CDHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should show an error page', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {},
        error: {
          message: 'this is an error'
        },
        refetch: jest.fn()
      }
    })
    const { container } = render(
      <TestWrapper queryParams={{ trial: true }}>
        <CDHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should refetch the module license info when the link in the error screen is clicked', async () => {
    const refetchMock = jest.fn()

    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {},
        error: {},
        refetch: refetchMock
      }
    })
    const { getByText } = render(
      <TestWrapper queryParams={{ trial: true }}>
        <CDHomePage />
      </TestWrapper>
    )

    const retryButton = getByText('Retry')

    fireEvent.click(retryButton)

    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(2))
  })
})
