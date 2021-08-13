import React from 'react'
import { Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import UsageInfoCard from './UsageInfoCard'

export interface CIUsageInfoProps {
  subscribedInst: number
  activeInst: number
  subscribedUsers: number
  activeUsers: number
}

const ActiveInstanceCard: React.FC<{ subscribedInst: number; activeInst: number }> = ({
  subscribedInst,
  activeInst
}) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.developers')
  //TO-DO: replace with tooltip
  const tooltip = 'Active Instance tooltip placeholder'
  const rightHeader = getString('common.subscriptions.usage.last60days')
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const rightFooter = getString('common.subscribed')
  const props = {
    subscribed: subscribedInst,
    usage: activeInst,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter,
    rightFooter
  }
  return <UsageInfoCard {...props} />
}

const ActiveUsers: React.FC<{ subscribedUsers: number; activeUsers: number }> = ({ subscribedUsers, activeUsers }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.ciUsers')
  //TO-DO: replace with tooltip
  const tooltip = 'Users tooltip placeholder'
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

const CIUsageInfo: React.FC<CIUsageInfoProps> = ({ subscribedInst, activeInst, subscribedUsers, activeUsers }) => {
  return (
    <Layout.Horizontal spacing="large">
      <ActiveInstanceCard subscribedInst={subscribedInst} activeInst={activeInst} />
      <ActiveUsers subscribedUsers={subscribedUsers} activeUsers={activeUsers} />
    </Layout.Horizontal>
  )
}

export default CIUsageInfo
