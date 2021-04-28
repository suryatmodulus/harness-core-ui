import React from 'react'
import { render, act, fireEvent, waitFor, queryByText, queryAllByText } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import TwoFactorAuthentication from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/TwoFactorAuthentication/TwoFactorAuthentication'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { mockResponse } from '@common/pages/AuthenticationSettings/__test__/mock'

jest.mock('services/cd-ng', () => ({
  useSetTwoFactorAuthAtAccountLevel: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  })
}))

const refetchAuthSettings = jest.fn()

describe('Two Factor Authentication', () => {
  test('Redirect to UserProfile', async () => {
    const { getByTestId } = render(
      <TestWrapper
        path={routes.toAuthenticationSettings({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <TwoFactorAuthentication twoFactorEnabled={false} onSuccess={refetchAuthSettings} />
      </TestWrapper>
    )

    const twoFAToggle = getByTestId('twoFA-toggle')
    act(() => {
      fireEvent.click(twoFAToggle!)
    })

    await waitFor(() => queryAllByText(document.body, 'common.authSettings.enforceTwoFA'))
    const confirmRedirectDialog = findDialogContainer()
    expect(confirmRedirectDialog).toBeTruthy()

    const goToSettingsBtn = queryByText(confirmRedirectDialog!, 'common.authSettings.goToSettings')
    await act(async () => {
      fireEvent.click(goToSettingsBtn!)
    })

    await waitFor(() => queryAllByText(document.body, 'common.authSettings.enforceTwoFA'))
    expect(findDialogContainer()).toBeFalsy()
  }),
    test('Disable Two Factor Authentication', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <TwoFactorAuthentication twoFactorEnabled onSuccess={refetchAuthSettings} />
        </TestWrapper>
      )

      const twoFAToggle = getByTestId('twoFA-toggle')
      act(() => {
        fireEvent.click(twoFAToggle!)
      })

      await waitFor(() => queryAllByText(document.body, 'common.authSettings.disableTwoFAEnforcement'))
      const confirmDisableDialog = findDialogContainer()
      expect(confirmDisableDialog).toBeTruthy()

      const disableButton = queryByText(confirmDisableDialog!, 'confirm')
      await act(async () => {
        fireEvent.click(disableButton!)
      })

      expect(queryByText(document.body, 'common.authSettings.twoFAEnforcementDisabled')).toBeTruthy()
    })
})
