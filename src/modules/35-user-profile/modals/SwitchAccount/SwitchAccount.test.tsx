import React, { useEffect } from 'react'
import { render, waitFor } from '@testing-library/react'

import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'

import mocks from './mocks.json'
import useSwitchAccountModal from './useSwitchAccountModal'

const TestComponent = (): null => {
  const { openSwitchAccountModal } = useSwitchAccountModal({ mock: mocks.user as any })
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

    await waitFor(() => expect(getByText('userProfile.switchAccount')).toBeDefined())
    const container = findDialogContainer()
    expect(container).toMatchSnapshot()
  })
})
