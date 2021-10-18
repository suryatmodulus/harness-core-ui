import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import AccountSideNav from '../AccountSideNav/AccountSideNav'

describe('AccountSideNav', () => {
  test('AccountSideNav simple snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <AccountSideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
