import React from 'react'
import { Layout, PageError } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import { useGetUsageAndLimit } from '@auth-settings/hooks/useGetUsageAndLimit'
import UsageInfoCard from './UsageInfoCard'

const ActiveCloudSpend: React.FC<{
  activeCloudSpend: number
  subscribedCloudSpend: number
  displayName: string | undefined
}> = ({ activeCloudSpend, subscribedCloudSpend, displayName }) => {
  const prefix = '$'
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.cloudSpend')
  //TO-DO: replace with tooltip
  const tooltip = 'Active Cloud tooltip placeholder'
  const rightHeader = displayName
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

const CCMUsageInfo: React.FC = () => {
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CE)
  const { usageErrorMsg, refetchUsage, usage } = usageData
  const { limitErrorMsg, refetchLimit, limit } = limitData

  if (usageErrorMsg) {
    return <PageError message={usageErrorMsg} onClick={() => refetchUsage?.()} />
  }

  if (limitErrorMsg) {
    return <PageError message={limitErrorMsg} onClick={() => refetchLimit?.()} />
  }

  return (
    <Layout.Horizontal spacing="large">
      <ActiveCloudSpend
        activeCloudSpend={usage?.ccm?.activeSpend?.count as number}
        subscribedCloudSpend={limit?.ccm?.totalSpendLimit || 0}
        displayName={usage?.ccm?.activeSpend?.displayName}
      />
    </Layout.Horizontal>
  )
}

export default CCMUsageInfo
