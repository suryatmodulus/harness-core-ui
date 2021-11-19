import React from 'react'
import { Layout, PageError } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import type { CELicenseSummaryDTO } from 'services/cd-ng'
import { ModuleName } from 'framework/types/ModuleName'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import UsageInfoCard from './UsageInfoCard'

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

const CCMUsageInfo: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()

  const {
    data: summaryData,
    loading: loadingSummaryData,
    error: summaryError,
    refetch: refetchSummary
  } = useGetLicensesAndSummary({
    queryParams: { moduleType: ModuleName.CE },
    accountIdentifier: accountId
  })

  const isLoading = loadingSummaryData

  if (isLoading) {
    return <ContainerSpinner />
  }

  if (summaryError) {
    return <PageError message={(summaryError.data as Error)?.message} onClick={() => refetchSummary()} />
  }

  return (
    <Layout.Horizontal spacing="large">
      <ActiveCloudSpend
        activeCloudSpend={0}
        subscribedCloudSpend={(summaryData?.data as CELicenseSummaryDTO).totalSpendLimit || 0}
      />
    </Layout.Horizontal>
  )
}

export default CCMUsageInfo
