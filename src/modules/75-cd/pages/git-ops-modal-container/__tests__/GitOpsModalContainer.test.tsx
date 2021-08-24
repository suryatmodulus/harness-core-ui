import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import GitOpsModalContainer from '../GitOpsModalContainer'

const currentUser = {
  defaultAccountId: '123',
  accounts: [
    {
      uuid: '123',
      createdFromNG: true
    }
  ]
}

describe('GitOpsModalContainer snapshot test', () => {
  test('should render GitOpsModalContainer', () => {
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <GitOpsModalContainer />
      </TestWrapper>
    )
    expect(getByText('cd.gitOps')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
