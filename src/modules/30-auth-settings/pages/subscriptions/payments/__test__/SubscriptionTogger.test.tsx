import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import { ModuleName } from 'framework/types/ModuleName'
import { Editions } from '@common/constants/SubscriptionTypes'
import SubscriptionToggler from '../SubscriptionCalculatorModal/SubscriptionToggler'

describe('SubscriptionToggler', () => {
  test('SubscriptionToggler', () => {
    const { container } = render(
      <TestWrapper>
        <SubscriptionToggler moduleName={ModuleName.CD} subscribePlan={Editions.ENTERPRISE} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
