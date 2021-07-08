import React from 'react'
import { render, act, fireEvent, waitFor, queryByText, queryAllByText } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { AuthenticationMechanisms } from '@auth-settings/constants/utils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { mockResponse, authSettings } from '@auth-settings/pages/Configuration/__test__/mock'
import PublicOAuthProviders from '../PublicOAuthProviders'

const refetchAuthSettings = jest.fn()
const setUpdating = jest.fn()

jest.mock('services/cd-ng', () => ({
  useUpdateOauthProviders: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useUpdateAuthMechanism: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useRemoveOauthMechanism: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  })
}))

const oneOauthEnabled = {
  ...authSettings,
  ngAuthSettings: [
    {
      allowedProviders: ['GITHUB'],
      settingsType: AuthenticationMechanisms.OAUTH
    }
  ]
}

const disabledOauthLogin = {
  ...authSettings,
  ngAuthSettings: authSettings.ngAuthSettings.filter(
    settings => settings.settingsType !== AuthenticationMechanisms.OAUTH
  )
}

describe('PublicOAuthProviders', () => {
  test('Disable OAuth Providers', async () => {
    const { getByTestId, container } = render(
      <TestWrapper
        path={routes.toAuthenticationSettings({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <PublicOAuthProviders
          authSettings={authSettings}
          refetchAuthSettings={refetchAuthSettings}
          canEdit
          setUpdating={setUpdating}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const toggleOAuthSwitch = getByTestId('toggle-oauth-providers')
    act(() => {
      fireEvent.click(toggleOAuthSwitch)
    })

    await waitFor(() => queryByText(document.body, 'authSettings.disableOAuthLogin'))
    const form = findDialogContainer()
    expect(form).toBeTruthy()

    const confirmBtn = queryByText(form!, 'confirm')
    await act(async () => {
      fireEvent.click(confirmBtn!)
    })

    expect(queryByText(document.body, 'authSettings.publicOAuthLoginDisabled')).toBeTruthy()
  }),
    test('Enable OAuth Providers', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <PublicOAuthProviders
            authSettings={disabledOauthLogin}
            refetchAuthSettings={refetchAuthSettings}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const toggleOAuthSwitch = getByTestId('toggle-oauth-providers')
      await act(async () => {
        fireEvent.click(toggleOAuthSwitch)
      })

      expect(queryByText(document.body, 'authSettings.publicOAuthLoginEnabled')).toBeTruthy()
    }),
    test('Update OAuth settings', () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <PublicOAuthProviders
            authSettings={authSettings}
            refetchAuthSettings={refetchAuthSettings}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const disableGithub = getByTestId('toggle-oauth-github')
      act(() => {
        fireEvent.click(disableGithub)
      })

      const enableGitlab = getByTestId('toggle-oauth-gitlab')
      act(() => {
        fireEvent.click(enableGitlab)
      })

      expect(queryAllByText(document.body, 'authSettings.oauthSettingsHaveBeenUpdated')).toBeTruthy()
    }),
    test('All oauth providers cannot be disabled, at least 1 is required', () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <PublicOAuthProviders
            authSettings={oneOauthEnabled}
            refetchAuthSettings={refetchAuthSettings}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const toggleOAuthSwitch = getByTestId('toggle-oauth-github')
      act(() => {
        fireEvent.click(toggleOAuthSwitch)
      })

      expect(queryByText(document.body, 'authSettings.keepAtLeastOneProviderEnabled')).toBeTruthy()
    })
})
