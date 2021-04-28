import React from 'react'
import { act, fireEvent, queryByText, render, waitFor } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import AccountAndOAuth from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/AccountAndOAuth'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { authSettings, mockResponse } from '@common/pages/AuthenticationSettings/__test__/mock'
import { AuthenticationMechanisms } from '@common/constants/Utils'

const refetchAuthSettings = jest.fn()

jest.mock('services/cd-ng', () => ({
  useUpdateAuthMechanism: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useUpdateOauthProviders: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useRemoveOauthMechanism: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  })
}))

const disabledAccountAndOauth = {
  ...authSettings,
  authenticationMechanism: AuthenticationMechanisms.SAML
}

describe('AccountAndOAuth', () => {
  let container: HTMLElement

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path={routes.toAuthenticationSettings({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <AccountAndOAuth authSettings={disabledAccountAndOauth} refetchAuthSettings={refetchAuthSettings} />
      </TestWrapper>
    )
    container = renderObj.container
  })

  test('Login via AccountAndOAuth', () => {
    expect(container).toMatchSnapshot()
  }),
    test('Enable Login via account or oauth providers', async () => {
      const radioButton = queryByText(container, 'common.authSettings.accountOrOAuthLogin')
      expect(radioButton).toBeTruthy()
      act(() => {
        fireEvent.click(radioButton!)
      })

      await waitFor(() => queryByText(document.body, 'common.authSettings.changeLoginToHarnessAccountOrOauth'))
      const confirmEnable = findDialogContainer()
      expect(confirmEnable).toBeTruthy()

      const confirmBtn = queryByText(confirmEnable!, 'confirm')
      await act(async () => {
        fireEvent.click(confirmBtn!)
      })

      expect(queryByText(document.body, 'accountOrOAuthLoginEnabledSuccessfully'))
    })
})
