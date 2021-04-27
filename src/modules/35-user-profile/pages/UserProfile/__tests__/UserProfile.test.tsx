import React from 'react'
import {
  RenderResult,
  render,
  fireEvent,
  waitFor,
  queryByText,
  act,
  queryByAttribute,
  getAllByText
} from '@testing-library/react'
import UserProfilePage from '@user-profile/pages/UserProfile/UserProfilePage'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { InputTypes, setFieldValue, clickSubmit } from '@common/utils/JestFormHelper'
import type { ResponseBoolean } from 'services/cd-ng'
import {
  connectorMockData,
  enabledTwoFactorAuth,
  mockResponse,
  mockSecretList,
  sourceCodeManagers,
  twoFactorAuthSettings,
  userMockData
} from './mock'

const createSCM = jest.fn()

const enableAuthfn = jest.fn()
const enableAuthMock = (): ResponseBoolean => {
  enableAuthfn()
  return mockResponse
}

const disableAuthfn = jest.fn()
const disableAuthMock = (): ResponseBoolean => {
  disableAuthfn()
  return mockResponse
}

jest.mock('services/cd-ng', () => ({
  useGetCurrentUserInfo: jest.fn().mockImplementation(() => {
    return { data: userMockData, refetch: jest.fn() }
  }),
  useSaveSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { mutate: createSCM }
  }),
  useDeleteSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useUpdateUserInfo: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  }),
  useGetConnectorList: jest.fn().mockImplementation(() => {
    return { ...connectorMockData, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetTwoFactorAuthSettings: jest.fn().mockImplementation(() => {
    return { data: twoFactorAuthSettings, refetch: jest.fn() }
  }),
  useEnableTwoFactorAuth: jest.fn().mockImplementation(() => {
    return { mutate: enableAuthMock }
  }),
  useDisableTwoFactorAuth: jest.fn().mockImplementation(() => {
    return { mutate: disableAuthMock }
  }),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecretList)),
  useGetSecretV2: jest.fn().mockImplementation(() => {
    return { data: mockSecretList, refetch: jest.fn() }
  }),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn() }
  }),
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(mockResponse) })),
  usePutSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

let enabledAuth = false

describe('User Profile Page', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']
  let getByTestId: RenderResult['getByTestId']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={enabledAuth ? enabledTwoFactorAuth : defaultAppStoreValues}
      >
        <UserProfilePage />
      </TestWrapper>
    )
    container = renderObj.container
    getByTestId = renderObj.getByTestId
    getByText = renderObj.getByText
  })

  test('User Profile', () => {
    expect(container).toMatchSnapshot()
  }),
    test('Edit User Profile', async () => {
      const edit = getByTestId('editUserProfile')
      act(() => {
        fireEvent.click(edit!)
      })
      await waitFor(() => queryByText(document.body, 'Edit Profile'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      setFieldValue({ container: form!, type: InputTypes.TEXTFIELD, fieldId: 'name', value: 'dummy name' })

      await act(async () => {
        clickSubmit(form!)
      })

      expect(queryByText(document.body, 'userProfile.userEditSuccess')).toBeTruthy()
    }),
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('Change Password', async () => {
      const password = getByText('userProfile.changePassword')
      act(() => {
        fireEvent.click(password!)
      })
      await waitFor(() => queryByText(document.body, 'Current Password'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      setFieldValue({ container: form!, type: InputTypes.TEXTFIELD, fieldId: 'currentPassword', value: 'password' })
      setFieldValue({ container: form!, type: InputTypes.TEXTFIELD, fieldId: 'newPassword', value: 'password@1D' })
      setFieldValue({ container: form!, type: InputTypes.TEXTFIELD, fieldId: 'confirmPassword', value: 'password@1D' })

      await act(async () => {
        clickSubmit(form!)
      })
    }),
    test('Add SCM', async () => {
      const addSCM = getByText('userProfile.plusSCM')
      expect(addSCM).toBeTruthy()
      act(() => {
        fireEvent.click(addSCM!)
      })
      await waitFor(() => queryByText(document.body, 'Add a Source Code Manager'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
    }),
    test('Delete SCM', async () => {
      const deleteIcon = queryByAttribute('data-testid', container, 'BB UP-delete')
      await act(async () => {
        fireEvent.click(deleteIcon!)
      })
      await waitFor(() => getAllByText(document.body, 'userProfile.confirmDeleteTitle')[0])
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      const deleteBtn = queryByText(form!, 'delete')
      await act(async () => {
        fireEvent.click(deleteBtn!)
      })
      expect(queryByText(document.body, 'userProfile.scmDeleteSuccess')).toBeTruthy()
    }),
    test('Add BitBucket SCM', async () => {
      const addSCM = getByText('userProfile.plusSCM')
      expect(addSCM).toBeTruthy()
      act(() => {
        fireEvent.click(addSCM!)
      })
      await waitFor(() => queryByText(document.body, 'userProfile.addSCM'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      setFieldValue({ container: form!, type: InputTypes.TEXTFIELD, fieldId: 'name', value: 'dummy name' })

      const bitBucket = queryByAttribute('data-icon', form!, 'bitbucket-blue')
      expect(bitBucket).toBeTruthy()

      act(() => {
        fireEvent.click(bitBucket!)
      })
      await waitFor(() => queryByText(form!, 'Authentication'))
      await waitFor(() => queryByText(form!, 'Username'))

      setFieldValue({ container: form!, type: InputTypes.TEXTFIELD, fieldId: 'usernametextField', value: 'user name' })

      const password = queryByText(form!, 'createOrSelectSecret')

      act(() => {
        fireEvent.click(password!)
      })
      await waitFor(() => queryByText(form!, 'Create a new secret'))
      const selectSecret = queryByText(document.body, 'Select an existing secret')
      expect(selectSecret).toBeTruthy()
      act(() => {
        fireEvent.click(selectSecret!)
      })

      const secret = queryByText(document.body, 'selected_secret')
      expect(secret).toBeTruthy()
      act(() => {
        fireEvent.click(secret!)
      })

      const applySelected = queryByText(document.body, 'entityReference.apply')
      act(() => {
        fireEvent.click(applySelected!)
      })
      expect(form).toMatchSnapshot()

      //Submit Form
      await act(async () => {
        clickSubmit(form!)
      })

      expect(createSCM).toHaveBeenCalled()
    }),
    test('Enable Two Factor Auth', async () => {
      enableAuthfn.mockReset()
      const twoFactorSwitch = getByTestId('TwoFactorAuthSwitch')
      expect(twoFactorSwitch).toBeTruthy()

      act(() => {
        fireEvent.click(twoFactorSwitch!)
      })
      await waitFor(() => getAllByText(document.body, 'userProfile.qrCode')[0])

      const form = findDialogContainer()
      expect(form).toBeTruthy()

      const enable = getAllByText(form!, 'enable')[0]
      await act(async () => {
        fireEvent.click(enable!)
      })
      expect(enableAuthfn).toBeCalled()
      enabledAuth = true
    }),
    test('Refetch Two Factor Auth and Disable Two Factor Auth', async () => {
      disableAuthfn.mockReset()

      //Refetch Two Factor Auth
      const reset = container.querySelector("[data-icon='reset']")
      expect(reset).toBeTruthy()
      act(() => {
        fireEvent.click(reset!)
      })
      await waitFor(() => getAllByText(document.body, 'userProfile.qrCode')[0])

      let form = findDialogContainer()
      expect(form).toBeTruthy()

      const cancel = getAllByText(form!, 'cancel')[0]
      await act(async () => {
        fireEvent.click(cancel!)
      })
      form = findDialogContainer()
      expect(form).toBeFalsy()

      //Disable Two Factor Auth
      const twoFactorSwitch = getByTestId('TwoFactorAuthSwitch')
      expect(twoFactorSwitch).toBeTruthy()

      act(() => {
        fireEvent.click(twoFactorSwitch!)
      })
      await waitFor(() => getAllByText(document.body, 'userProfile.twoFactor.disableTitle')[0])
      form = findDialogContainer()
      expect(form).toBeTruthy()
      const disable = getAllByText(form!, 'common.disable')[0]
      await act(async () => {
        fireEvent.click(disable!)
      })
      expect(disableAuthfn).toBeCalled()
      enabledAuth = false
    })
})
