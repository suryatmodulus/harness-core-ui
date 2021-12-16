import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import PaymentInfo from '../SubscriptionPayModal/PaymentInfo'
describe('PaymentInfo', () => {
  test('PaymentInfo', () => {
    const { container } = render(
      <TestWrapper>
        <PaymentInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
