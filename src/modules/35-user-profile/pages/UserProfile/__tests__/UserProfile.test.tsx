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
import * as cdngServices from 'services/cd-ng'
import type { ResponseBoolean } from 'services/cd-ng'
import { ChangePasswordResponse } from '@user-profile/modals/useChangePassword/views/ChangePasswordForm'
import {
  connectorMockData,
  enabledTwoFactorAuth,
  mockResponse,
  mockSecretList,
  sourceCodeManagers,
  emptySourceCodeManagers,
  twoFactorAuthSettings,
  userMockData,
  mockMyProfiles,
  passwordStrengthPolicy
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

jest.spyOn(cdngServices, 'useGetCurrentUserInfo').mockImplementation(() => {
  return { data: userMockData, refetch: jest.fn() } as any
})
jest.spyOn(cdngServices, 'useSaveSourceCodeManagers').mockImplementation(() => {
  return { mutate: createSCM } as any
})
jest.spyOn(cdngServices, 'useDeleteSourceCodeManagers').mockImplementation(() => {
  return { mutate: () => Promise.resolve(mockResponse) } as any
})
jest.spyOn(cdngServices, 'useUpdateUserInfo').mockImplementation(() => {
  return { mutate: () => Promise.resolve(mockResponse) } as any
})
jest.spyOn(cdngServices, 'useUpdateSourceCodeManagers').mockImplementation(() => {
  return { data: [], refetch: jest.fn() } as any
})
jest.spyOn(cdngServices, 'useGetConnectorList').mockImplementation(() => {
  return { ...connectorMockData, refetch: jest.fn(), error: null, loading: false } as any
})
jest.spyOn(cdngServices, 'useGetTwoFactorAuthSettings').mockImplementation(() => {
  return { data: twoFactorAuthSettings, refetch: jest.fn() } as any
})
jest.spyOn(cdngServices, 'useEnableTwoFactorAuth').mockImplementation(() => {
  return { mutate: enableAuthMock } as any
})
jest.spyOn(cdngServices, 'useDisableTwoFactorAuth').mockImplementation(() => {
  return { mutate: disableAuthMock } as any
})
jest.spyOn(cdngServices, 'listSecretsV2Promise').mockImplementation(() => Promise.resolve(mockSecretList) as any),
  jest.spyOn(cdngServices, 'useGetSecretV2').mockImplementation(() => {
    return { data: mockSecretList, refetch: jest.fn() } as any
  })
jest.spyOn(cdngServices, 'useGetConnector').mockImplementation(() => {
  return { data: {}, refetch: jest.fn() } as any
})
jest
  .spyOn(cdngServices, 'usePostSecret')
  .mockImplementation(() => ({ mutate: () => Promise.resolve(mockResponse) } as any))
jest.spyOn(cdngServices, 'usePutSecret').mockImplementation(() => ({ mutate: jest.fn() } as any))
jest.spyOn(cdngServices, 'usePostSecretFileV2').mockImplementation(() => ({ mutate: jest.fn() } as any))
jest.spyOn(cdngServices, 'usePutSecretFileV2').mockImplementation(() => ({ mutate: jest.fn() } as any))
jest.spyOn(cdngServices, 'useGetAuthenticationSettings').mockImplementation(() => {
  return { data: passwordStrengthPolicy } as any
})
jest.spyOn(cdngServices, 'useGetUserProjectInfo').mockImplementation(() => {
  return { data: mockMyProfiles } as any
})
jest.spyOn(cdngServices, 'useChangeUserPassword').mockImplementation(() => {
  return {
    mutate: () =>
      Promise.resolve({
        data: ChangePasswordResponse.PASSWORD_CHANGED
      })
  } as any
})
jest.spyOn(cdngServices, 'useResendVerifyEmail').mockImplementation(() => {
  return {
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return {
        status: 'SUCCESS'
      }
    })
  } as any
})

jest.spyOn(cdngServices, 'useGetSourceCodeManagers').mockImplementation(() => {
  return { data: emptySourceCodeManagers, refetch: jest.fn() } as any
})

let enabledAuth = false

describe('User Profile Page', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']
  let getByTestId: RenderResult['getByTestId']

  const testSetup = () => {
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
  }

  test('User Profile', () => {
    testSetup()
    expect(container).toMatchSnapshot()
  }),
    test('Edit User Profile', async () => {
      testSetup()
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
    test('Add SCM', async () => {
      testSetup()
      const addSCM = getByText('userProfile.plusSCM')
      expect(addSCM).toBeTruthy()
      act(() => {
        fireEvent.click(addSCM!)
      })
      await waitFor(() => queryByText(document.body, 'userProfile.addSCM'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
    }),
    // Only github SCM is supported ATM
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('Add BitBucket SCM', async () => {
      testSetup()
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
      await waitFor(() => queryByText(form!, 'secrets.titleCreate'))
      const selectSecret = queryByText(document.body, 'secrets.titleSelect')
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
    test('Add SCM should not be visible', async () => {
      jest.spyOn(cdngServices, 'useGetSourceCodeManagers').mockImplementation(() => {
        return { data: sourceCodeManagers, refetch: jest.fn() } as any
      })
      testSetup()
      const addSCM = container.querySelector('[data-test="userProfileAddSCM"]')
      expect(addSCM).toBeFalsy()
    }),
    test('Delete SCM', async () => {
      testSetup()
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
    test('Enable Two Factor Auth', async () => {
      testSetup()
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
      testSetup()
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
    }),
    test('Change Password', async () => {
      testSetup()
      const password = queryByText(container, 'userProfile.changePassword')
      act(() => {
        fireEvent.click(password!)
      })

      await waitFor(() => getAllByText(document.body, 'userProfile.changePassword')[1])
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      setFieldValue({ container: form!, type: InputTypes.TEXTFIELD, fieldId: 'currentPassword', value: 'password' })
      setFieldValue({ container: form!, type: InputTypes.TEXTFIELD, fieldId: 'newPassword', value: 'password@1DD' })
      setFieldValue({ container: form!, type: InputTypes.TEXTFIELD, fieldId: 'confirmPassword', value: 'password@1DD' })

      const currentPasswordView = form!.querySelectorAll("[data-icon='eye-off']")[0]
      const newPasswordView = form!.querySelectorAll("[data-icon='eye-off']")[1]
      const confirmPasswordView = form!.querySelectorAll("[data-icon='eye-off']")[2]
      expect(currentPasswordView).toBeTruthy()
      act(() => {
        fireEvent.click(currentPasswordView!)
        fireEvent.click(currentPasswordView!)
        fireEvent.click(newPasswordView!)
        fireEvent.click(confirmPasswordView!)
      })

      await act(async () => {
        clickSubmit(form!)
      })

      expect(queryByText(document.body, 'userProfile.passwordChangedSuccessfully')).toBeTruthy()
    }),
    test('No Projects Found', () => {
      jest.spyOn(cdngServices, 'useGetUserProjectInfo').mockImplementation(() => {
        return { data: { ...mockMyProfiles, data: { content: [] } } } as any
      })
      testSetup()
      expect(queryByText(document.body, 'noProjects')).toBeTruthy()
    })
})
