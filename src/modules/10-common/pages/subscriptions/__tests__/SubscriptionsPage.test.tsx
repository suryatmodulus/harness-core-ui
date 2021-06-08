import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SubscriptionsPage from '../SubscriptionsPage'

describe('Subscriptions Page', () => {
  test('it renders the subscriptions page', () => {
    const { container } = render(
      <TestWrapper>
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
