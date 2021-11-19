import React from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Layout, PageError } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import { useGetUsage } from 'services/ci'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { ModuleName } from 'framework/types/ModuleName'
import type { CILicenseSummaryDTO } from 'services/cd-ng'
import UsageInfoCard from './UsageInfoCard'

interface ActiveUsersProps {
  subscribedUsers: number
  activeUsers: number
  rightHeader: string
}

const ActiveUsers: React.FC<ActiveUsersProps> = ({ subscribedUsers, activeUsers, rightHeader }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.ciUsers')
  //TO-DO: replace with tooltip
  const tooltip = 'Users tooltip placeholder'
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
const timestamp = moment.now()

const CIUsageInfo: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const {
    data: usageData,
    loading: loadingUsageData,
    error: usageError,
    refetch: refetchUsage
  } = useGetUsage({
    queryParams: {
      accountIdentifier: accountId,
      timestamp
    }
  })

  const {
    data: summaryData,
    loading: loadingSummaryData,
    error: summaryError,
    refetch: refetchSummary
  } = useGetLicensesAndSummary({
    queryParams: { moduleType: ModuleName.CI },
    accountIdentifier: accountId
  })

  const isLoading = loadingUsageData || loadingSummaryData

  if (isLoading) {
    return <ContainerSpinner />
  }

  if (usageError) {
    return <PageError message={usageError?.message} onClick={() => refetchUsage()} />
  }

  if (summaryError) {
    return <PageError message={(summaryError.data as Error)?.message} onClick={() => refetchSummary()} />
  }
  const summary = summaryData?.data as CILicenseSummaryDTO

  return (
    <Layout.Horizontal spacing="large">
      <ActiveUsers
        rightHeader={usageData?.data?.activeCommitters?.displayName || ''}
        subscribedUsers={summary.totalDevelopers || 0}
        activeUsers={usageData?.data?.activeCommitters?.count || 0}
      />
    </Layout.Horizontal>
  )
}

export default CIUsageInfo
