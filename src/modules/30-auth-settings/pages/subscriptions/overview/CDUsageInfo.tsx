import React from 'react'
import { Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import UsageInfoCard from './UsageInfoCard'
export interface CDUsageInfoProps {
  subscribedIns: number
  activeIns: number
  subscribedService: number
  activeService: number
  subscribedUsers: number
  activeUsers: number
}
const ActiveInstanceCard: React.FC<{ subscribedIns: number; activeIns: number }> = ({ subscribedIns, activeIns }) => {
  const { getString } = useStrings()

  const leftHeader = getString('common.subscriptions.usage.srvcInst')
  const tooltip = 'Active Instance tooltip placeholder'
  const rightHeader = getString('common.subscriptions.usage.last60days')
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const rightFooter = getString('common.subscribed')
  const props = {
    subscribed: subscribedIns,
    usage: activeIns,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter,
    rightFooter
  }
  return <UsageInfoCard {...props} />
}

const ActiveServices: React.FC<{ subscribedService: number; activeService: number }> = ({
  subscribedService,
  activeService
}) => {
  const { getString } = useStrings()

  const leftHeader = getString('common.subscriptions.usage.services')
  //TO-DO: replace with tooltip
  const tooltip = 'Services tooltip placeholder'
  const rightHeader = getString('common.subscriptions.usage.last60days')
  const hasBar = true
  const leftFooter = getString('total')
  const props = {
    subscribed: subscribedService,
    usage: activeService,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter
  }
  return <UsageInfoCard {...props} />
}

const ActiveUsers: React.FC<{ subscribedUsers: number; activeUsers: number }> = ({ subscribedUsers, activeUsers }) => {
  const { getString } = useStrings()

  const leftHeader = getString('common.subscriptions.usage.cdUsers')
  //TO-DO: replace with tooltip
  const tooltip = 'Active CD Users tooltip placeholder'
  const rightHeader = getString('common.subscriptions.usage.last60days')
  const hasBar = true
  const leftFooter = getString('common.totalHarnessUser')
  const props = {
    subscribed: subscribedUsers,
    usage: activeUsers,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter
  }
  return <UsageInfoCard {...props} />
}

const CDUsageInfo: React.FC<CDUsageInfoProps> = ({
  subscribedIns,
  activeIns,
  subscribedService,
  activeService,
  subscribedUsers,
  activeUsers
}) => {
  return (
    <Layout.Horizontal spacing="large">
      <ActiveInstanceCard subscribedIns={subscribedIns} activeIns={activeIns} />
      <ActiveServices subscribedService={subscribedService} activeService={activeService} />
      <ActiveUsers subscribedUsers={subscribedUsers} activeUsers={activeUsers} />
    </Layout.Horizontal>
  )
}

export default CDUsageInfo
