import React from 'react'
import { Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import UsageInfoCard from './UsageInfoCard'

export interface FFUsageInfoProps {
  subscribedUsers: number
  activeUsers: number
  subscribedMonthlyUsers: number
  activeMonthlyUsers: number
  month: string
  featureFlags: number
}
const FeatureFlagsUsersCard: React.FC<{ subscribedUsers: number; activeUsers: number }> = ({
  subscribedUsers,
  activeUsers
}) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.ffUsers')
  //TO-DO: replace with tooltip
  const tooltip = 'Active Instance tooltip placeholder'
  const rightHeader = getString('common.subscriptions.usage.last60days')
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const rightFooter = getString('common.subscribed')
  const props = {
    subscribed: subscribedUsers,
    usage: activeUsers,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter,
    rightFooter
  }
  return <UsageInfoCard {...props} />
}

const MonthlyActiveUsers: React.FC<{ subscribedMonthlyUsers: number; activeMonthlyUsers: number; month: string }> = ({
  subscribedMonthlyUsers,
  activeMonthlyUsers,
  month
}) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.monthlyUsers')
  //TO-DO: replace with tooltip
  const tooltip = 'Users tooltip placeholder'
  const rightHeader = month
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const props = {
    subscribed: subscribedMonthlyUsers,
    usage: activeMonthlyUsers,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter
  }
  return <UsageInfoCard {...props} />
}

const FeatureFlags: React.FC<{ featureFlags: number }> = ({ featureFlags }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.purpose.cf.continuous')
  //TO-DO: replace with tooltip
  const tooltip = 'Users tooltip placeholder'
  const rightHeader = getString('common.current')
  const hasBar = false
  const props = { usage: featureFlags, leftHeader, tooltip, rightHeader, hasBar }
  return <UsageInfoCard {...props} />
}

const FFUsageInfo: React.FC<FFUsageInfoProps> = ({
  subscribedUsers,
  activeUsers,
  subscribedMonthlyUsers,
  activeMonthlyUsers,
  month,
  featureFlags
}) => {
  return (
    <Layout.Horizontal spacing="large">
      <FeatureFlagsUsersCard subscribedUsers={subscribedUsers} activeUsers={activeUsers} />
      <MonthlyActiveUsers
        subscribedMonthlyUsers={subscribedMonthlyUsers}
        activeMonthlyUsers={activeMonthlyUsers}
        month={month}
      />
      <FeatureFlags featureFlags={featureFlags} />
    </Layout.Horizontal>
  )
}

export default FFUsageInfo
