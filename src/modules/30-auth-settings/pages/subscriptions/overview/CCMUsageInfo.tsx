import React from 'react'
import { Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import UsageInfoCard from './UsageInfoCard'

export interface CCMUsageInfoProps {
  activeCloudSpend: number
  subscribedCloudSpend: number
  subscribedCCMUsers: number
  activeCCMUsers: number
}

const ActiveCloudSpend: React.FC<{ activeCloudSpend: number; subscribedCloudSpend: number }> = ({
  activeCloudSpend,
  subscribedCloudSpend
}) => {
  const prefix = '$'
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.cloudSpend')
  //TO-DO: replace with tooltip
  const tooltip = 'Active Cloud tooltip placeholder'
  const rightHeader = getString('common.subscriptions.usage.last60days')
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const rightFooter = getString('common.subscribed')
  const props = {
    subscribed: subscribedCloudSpend,
    usage: activeCloudSpend,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter,
    rightFooter,
    prefix
  }
  return <UsageInfoCard {...props} />
}

const ActiveUsers: React.FC<{ subscribedCCMUsers: number; activeCCMUsers: number }> = ({
  subscribedCCMUsers,
  activeCCMUsers
}) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.ccmUsers')
  //TO-DO: replace with tooltip
  const tooltip = 'Active Clould Users tooltip placeholder'
  const rightHeader = getString('common.subscriptions.usage.last60days')
  const hasBar = true
  const leftFooter = getString('common.totalHarnessUser')
  const props = {
    subscribed: subscribedCCMUsers,
    usage: activeCCMUsers,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter
  }
  return <UsageInfoCard {...props} />
}

const CCMUsageInfo: React.FC<CCMUsageInfoProps> = ({
  activeCloudSpend,
  subscribedCloudSpend,
  subscribedCCMUsers,
  activeCCMUsers
}) => {
  return (
    <Layout.Horizontal spacing="large">
      <ActiveCloudSpend activeCloudSpend={activeCloudSpend} subscribedCloudSpend={subscribedCloudSpend} />
      <ActiveUsers subscribedCCMUsers={subscribedCCMUsers} activeCCMUsers={activeCCMUsers} />
    </Layout.Horizontal>
  )
}

export default CCMUsageInfo
