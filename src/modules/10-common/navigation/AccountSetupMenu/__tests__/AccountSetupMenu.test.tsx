import React from 'react'
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import AccountSetupMenu from '../AccountSetupMenu'

const featureFlags = {
  NG_RBAC_ENABLED: true,
  NG_SIGNUP: true
}

describe('Account Setup Menu', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={{ featureFlags }}
      >
        <AccountSetupMenu />
      </TestWrapper>
    )
    container = renderObj.container
    getByText = renderObj.getByText
  })
  test('it renders the chevron', () => {
    expect(container).toMatchSnapshot()
  })
  test('it renders the dropdown with the overview link', async () => {
    const accountSetup = getByText('common.accountSetup')
    fireEvent.mouseEnter(accountSetup)

    await waitFor(() => {
      expect(getByText('overview')).toBeTruthy
    })

    expect(container).toMatchSnapshot()
  })
  test('it renders the dropdown with the authentication link', async () => {
    const accountSetup = getByText('common.accountSetup')
    fireEvent.mouseEnter(accountSetup)

    await waitFor(() => {
      expect(getByText('authentication')).toBeTruthy
    })

    expect(container).toMatchSnapshot()
  })
  test('it renders the dropdown with the connectors link', async () => {
    const accountSetup = getByText('common.accountSetup')
    fireEvent.mouseEnter(accountSetup)

    await waitFor(() => {
      expect(getByText('connectorsLabel')).toBeTruthy
    })

    expect(container).toMatchSnapshot()
  })
  test('it renders the dropdown with the secrets link', async () => {
    const accountSetup = getByText('common.accountSetup')
    fireEvent.mouseEnter(accountSetup)

    await waitFor(() => {
      expect(getByText('common.secrets')).toBeTruthy
    })

    expect(container).toMatchSnapshot()
  })
  test('it renders the dropdown with the access control link', async () => {
    const accountSetup = getByText('common.accountSetup')
    fireEvent.mouseEnter(accountSetup)

    await waitFor(() => {
      expect(getByText('accessControl')).toBeTruthy
    })

    expect(container).toMatchSnapshot()
  })
  test('it renders the dropdown with the subscriptions link', async () => {
    const accountSetup = getByText('common.accountSetup')
    fireEvent.mouseEnter(accountSetup)

    await waitFor(() => {
      expect(getByText('common.subscriptions')).toBeTruthy
    })

    expect(container).toMatchSnapshot()
  })
  test('it renders the dropdown with the organizations link', async () => {
    const accountSetup = getByText('common.accountSetup')
    fireEvent.mouseEnter(accountSetup)

    await waitFor(() => {
      expect(getByText('orgsText')).toBeTruthy
    })

    expect(container).toMatchSnapshot()
  })
})
