import React from 'react'
import { render, act, fireEvent, waitFor, queryByText, queryAllByText } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import RestrictEmailDomains from '@common/pages/AuthenticationSettings/Configuration/RestrictEmailDomains/RestrictEmailDomains'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { mockResponse } from '@common/pages/AuthenticationSettings/__test__/mock'

jest.mock('services/cd-ng', () => ({
  useUpdateWhitelistedDomains: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  })
}))

const refetchAuthSettings = jest.fn()
const whitelistedDomains = ['harness.io']

describe('RestrictEmailDomains', () => {
  test('Disable email restrictions', async () => {
    const { container, getByTestId } = render(
      <TestWrapper
        path={routes.toAuthenticationSettings({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <RestrictEmailDomains whitelistedDomains={whitelistedDomains} refetchAuthSettings={refetchAuthSettings} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const toggleRestrictEmailDomains = getByTestId('toggle-restrict-email-domains')
    act(() => {
      fireEvent.click(toggleRestrictEmailDomains)
    })

    await waitFor(() => queryByText(document.body, 'common.authSettings.disableWhitelistedDomains'))
    const confirmForm = findDialogContainer()
    expect(confirmForm).toBeTruthy()

    const confirmButton = queryByText(confirmForm!, 'confirm')
    await act(async () => {
      fireEvent.click(confirmButton!)
    })

    expect(queryAllByText(document.body, 'common.authSettings.whitelistedDomainsDisabled')).toBeTruthy()
  }),
    test('Update email restrictions', async () => {
      const { container, getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <RestrictEmailDomains whitelistedDomains={whitelistedDomains} refetchAuthSettings={refetchAuthSettings} />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()

      const updateRestrictEmailDomains = getByTestId('update-restrict-email-domains')
      act(() => {
        fireEvent.click(updateRestrictEmailDomains)
      })

      await waitFor(() => queryByText(document.body, 'common.authSettings.allowLoginFromTheseDomains'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      const saveButton = queryByText(form!, 'save')
      await act(async () => {
        fireEvent.click(saveButton!)
      })

      expect(queryAllByText(document.body, 'common.authSettings.WhitelistedDomainsUpdated')).toBeTruthy()
    })
})
