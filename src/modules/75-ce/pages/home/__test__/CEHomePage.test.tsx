import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetModuleLicenseInfo, useStartTrial } from 'services/portal'
import { useGetProjectList } from 'services/cd-ng'
import useCETrialModal from '@ce/modals/CETrialModal/useCETrialModal'
import CEHomePage from '../CEHomePage'

jest.mock('services/portal')
const useGetModuleLicenseInfoMock = useGetModuleLicenseInfo as jest.MockedFunction<any>
const useStartTrialMock = useStartTrial as jest.MockedFunction<any>

jest.mock('services/cd-ng')
const useGetProjectListMock = useGetProjectList as jest.MockedFunction<any>

jest.mock('@ce/modals/CETrialModal/useCETrialModal')
const useCETrialModalMock = useCETrialModal as jest.MockedFunction<any>

const currentUser = {
  defaultAccountId: '123',
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
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <CEHomePage />
      </TestWrapper>
    )
    expect(getByText('ce.homepage.slogan')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should return error page if the modulce license call fails', () => {
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
        data: null,
        error: {
          message: 'call failed'
        },
        refetch: jest.fn()
      }
    })
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <CEHomePage />
      </TestWrapper>
    )
    expect(getByText('call failed')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should return error page if the get project list call fails', () => {
    useCETrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))
    useGetProjectListMock.mockImplementation(() => {
      return {
        data: {
          content: []
        },
        error: {
          message: 'call failed'
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
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <CEHomePage />
      </TestWrapper>
    )
    expect(getByText('call failed')).toBeDefined()
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
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <CEHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should display a loading spinner if the project list call is loading', () => {
    useCETrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))
    useGetProjectListMock.mockImplementation(() => {
      return {
        data: {
          content: []
        },
        loading: true
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
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
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
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }} queryParams={{ trial: true }}>
        <CEHomePage />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('common.trialInProgress')).toBeDefined())

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

    render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }} queryParams={{ trial: true }}>
        <CEHomePage />
      </TestWrapper>
    )

    expect(showModalMock).toHaveBeenCalled()
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
      defaultAccountId: '123',
      accounts: [
        {
          uuid: '123',
          createdFromNG: false
        }
      ]
    }

    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: userCreatedFromCG }} queryParams={{ trial: true }}>
        <CEHomePage />
      </TestWrapper>
    )

    expect(getByText('ce.homepage.slogan')).toBeDefined()

    expect(container).toMatchSnapshot()
  })
})
