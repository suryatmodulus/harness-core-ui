import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import SubscriptionUsageCard from '../overview/SubscriptionUsageCard'

const cdUsageInfoProps = {
  subscribedIns: 40,
  activeIns: 42,
  subscribedService: 38,
  activeService: 25,
  subscribedUsers: 10,
  activeUsers: 3
}
const ciUsageInfoProps = {
  subscribedInst: 25,
  activeInst: 20,
  subscribedUsers: 10,
  activeUsers: 3
}
const ffUsageInfoProps = {
  subscribedUsers: 2,
  activeUsers: 2,
  subscribedMonthlyUsers: 25000,
  activeMonthlyUsers: 12500,
  month: 'March 2021',
  featureFlags: 70
}
const ccmUsageInfoProps = {
  activeCloudSpend: 2620000,
  subscribedCloudSpend: 2500000,
  subscribedCCMUsers: 10,
  activeCCMUsers: 3
}

describe('SubscriptionUsageCard', () => {
  test('CD', () => {
    const { container } = render(
      <TestWrapper>
        <SubscriptionUsageCard module={ModuleName.CD} cdUsageInfoProps={cdUsageInfoProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('CI', () => {
    const { container } = render(
      <TestWrapper>
        <SubscriptionUsageCard module={ModuleName.CI} ciUsageInfoProps={ciUsageInfoProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test('CCM', () => {
    const { container } = render(
      <TestWrapper>
        <SubscriptionUsageCard module={ModuleName.CE} ccmUsageInfoProps={ccmUsageInfoProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test('FF', () => {
    const { container } = render(
      <TestWrapper>
        <SubscriptionUsageCard module={ModuleName.CF} ffUsageInfoProps={ffUsageInfoProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
