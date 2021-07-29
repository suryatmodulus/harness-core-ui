import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetLicensesAndSummary, useStartTrialLicense, useExtendTrialLicense } from 'services/cd-ng'
import { useGetProjectList, useSaveFeedback } from 'services/cd-ng'
import useCETrialModal from '@ce/modals/CETrialModal/useCETrialModal'
import CEHomePage from '../CEHomePage'

jest.mock('services/cd-ng')
const useGetModuleLicenseInfoMock = useGetLicensesAndSummary as jest.MockedFunction<any>
const useStartTrialMock = useStartTrialLicense as jest.MockedFunction<any>
const useGetProjectListMock = useGetProjectList as jest.MockedFunction<any>
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

jest.mock('@ce/modals/CETrialModal/useCETrialModal')
const useCETrialModalMock = useCETrialModal as jest.MockedFunction<any>

const currentUser = {
  accounts: [
    {
      uuid: '123',
      createdFromNG: true
    }
  ]
}

describe('CEHomePage snapshot test', () => {
  test('should render HomePageTemplate when return success with data', () => {
    useCETrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))

    useGetProjectListMock.mockImplementation(() => {
      return {
        data: {
          content: []
        }
      }
    })
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
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
      >
        <CEHomePage />
      </TestWrapper>
    )
    expect(getByText('ce.homepage.slogan')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should display a loading spinner if the module license call is loading', () => {
    useCETrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))
    useGetProjectListMock.mockImplementation(() => {
      return {
        data: {
          content: []
        }
      }
    })
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        loading: true,
        refetch: jest.fn()
      }
    })
    const { container } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
      >
        <CEHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should move to trial in progress page when query param trial is true', async () => {
    useCETrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))
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

    useGetProjectListMock.mockImplementation(() => {
      return {
        data: {
          content: []
        }
      }
    })

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
    const { container } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
        queryParams={{ trial: true }}
      >
        <CEHomePage />
      </TestWrapper>
    )

    // await waitFor(() => expect(getByText('common.trialInProgress')).toBeDefined())

    expect(container).toMatchSnapshot()
  })

  test('should open the ce trial modal when there is a trial and projects exist', async () => {
    const showModalMock = jest.fn()

    useCETrialModalMock.mockImplementation(() => ({ showModal: showModalMock, hideModal: jest.fn() }))

    useGetProjectListMock.mockImplementation(() => {
      return {
        data: {
          content: ['1']
        }
      }
    })

    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          status: 'SUCCESS'
        },
        error: null,
        refetch: jest.fn()
      }
    })

    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
        queryParams={{ trial: true }}
      >
        <CEHomePage />
      </TestWrapper>
    )

    const cta = getByText('ce.trialCta')
    await waitFor(() => {
      cta.click()
    })
    expect(container).toMatchSnapshot()
  })

  test("shouldn't show the trial home pagers if the user is not created from NG", async () => {
    useCETrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))
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

    useGetProjectListMock.mockImplementation(() => {
      return {
        data: {
          content: []
        }
      }
    })

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

    const userCreatedFromCG = {
      accounts: [
        {
          uuid: '123',
          createdFromNG: false
        }
      ]
    }

    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: userCreatedFromCG }}
        queryParams={{ trial: true }}
      >
        <CEHomePage />
      </TestWrapper>
    )

    expect(getByText('ce.homepage.slogan')).toBeDefined()

    expect(container).toMatchSnapshot()
  })
})
