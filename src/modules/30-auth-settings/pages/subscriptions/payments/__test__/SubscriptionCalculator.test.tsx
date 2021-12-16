import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import SubscriptionCalculator from '../SubscriptionCalculatorModal/SubscriptionCalculator'

describe('SubscriptionCalculator', () => {
  test('SubscriptionCalculator', () => {
    const { container } = render(
      <TestWrapper>
        <SubscriptionCalculator unitPrice={100} supportPrice={200} onReviewChange={jest.fn()} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
