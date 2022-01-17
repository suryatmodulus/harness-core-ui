/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { findByTestId, findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'

import mocks from './mocks.json'
import useSwitchAccountModal from './useSwitchAccountModal'

const setDefaultAccountMock = jest.fn(() => mocks.switchAccount)
const switchAccountMock = jest.fn(() => mocks.switchAccount)

jest.mock('services/portal', () => ({
  ...(jest.requireActual('services/portal') as any),
  useGetUser: () => {
    return {
      ...mocks.user,
      refetch: jest.fn()
    }
  },
  useSetDefaultAccountForCurrentUser: () => {
    return {
      mutate: setDefaultAccountMock
    }
  },
  useRestrictedSwitchAccount: () => {
    return {
      mutate: switchAccountMock
    }
  }
}))

const TestComponent = (): null => {
  const { openSwitchAccountModal } = useSwitchAccountModal({})
  useEffect(() => {
    openSwitchAccountModal()
  }, [openSwitchAccountModal])
  return null
}

describe('Switch Account', () => {
  test('render', async () => {
    const { getByText } = render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('common.switchAccount')).toBeDefined())
    const container = findDialogContainer()
    expect(container).toMatchSnapshot()
  })

  test('set as default', async () => {
    const { getByText } = render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('common.switchAccount')).toBeDefined())
    const container = findDialogContainer()
    const setAsDefaultBtn = await findByTestId(container!, 'set-default-account-AutomationOne')
    expect(setAsDefaultBtn).toBeDefined()

    act(() => {
      fireEvent.click(setAsDefaultBtn)
    })
    const confirmDialog = document.querySelectorAll('.bp3-dialog')[1] as HTMLElement
    expect(confirmDialog).toMatchSnapshot()

    const continueBtn = await findByText(confirmDialog, 'continue')
    act(() => {
      fireEvent.click(continueBtn)
    })
    expect(setDefaultAccountMock).toHaveBeenCalledWith(undefined, {
      pathParams: { accountId: 'XICOBc_qRa2PJmVaWOx-cQ' }
    })
  })

  test('switch account', async () => {
    const { getByText } = render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('common.switchAccount')).toBeDefined())
    const container = findDialogContainer()
    const switchAccountBtn = await findByText(container!, 'AutomationOne')
    expect(switchAccountBtn).toBeDefined()

    act(() => {
      fireEvent.click(switchAccountBtn)
    })

    expect(switchAccountMock).toHaveBeenCalledWith({ accountId: 'XICOBc_qRa2PJmVaWOx-cQ' })
  })
})
