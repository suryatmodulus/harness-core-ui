import React from 'react'
import moment from 'moment'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import { ModuleName } from 'framework/types/ModuleName'
import { Editions, PLAN_UNIT } from '@common/constants/SubscriptionTypes'
import SubscribeInfo from '../SubscriptionPayModal/SubscribeInfo'

moment.now = jest.fn(() => 1482363367071)

describe('SubscribeInfo', () => {
  test('SubscribeInfo', () => {
    const { container } = render(
      <TestWrapper>
        <SubscribeInfo
          moduleName={ModuleName.CD}
          subscribePlanInfo={{
            services: 20,
            unitPrice: 24,
            premiumSupport: 120,
            subscribePlan: Editions.ENTERPRISE,
            unit: PLAN_UNIT.MONTHLY
          }}
          currentPlanInfo={{
            currentPlan: Editions.FREE,
            currentPlanInfo: {
              services: 12
            }
          }}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
