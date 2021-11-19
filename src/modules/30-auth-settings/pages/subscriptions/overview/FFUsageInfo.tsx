import React from 'react'
import moment from 'moment'
import { Layout, PageError } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { GetDataError } from 'restful-react'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import { useGetLicenseUsage } from 'services/cf'
import type { CFLicenseSummaryDTO, Failure } from 'services/cd-ng'
import { ModuleName } from 'framework/types/ModuleName'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import UsageInfoCard from './UsageInfoCard'

export interface FFUsageInfoProps {
  subscribedUsers: number
  activeUsers: number
  subscribedMonthlyUsers: number
  activeMonthlyUsers: number
  month: string
  featureFlags: number
}

interface FeatureFlagsUsersCardProps {
  subscribedUsers: number
  activeUsers: number
  rightHeader: string
  errors: {
    usageError: GetDataError<void> | null
    summaryError: GetDataError<Failure | Error> | null
  }
  refetches: {
    refetchUsage: () => void
    refetchSummary: () => void
  }
}
const FeatureFlagsUsersCard: React.FC<FeatureFlagsUsersCardProps> = ({
  subscribedUsers,
  activeUsers,
  rightHeader,
  errors,
  refetches
}) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.ffUsers')
  //TO-DO: replace with tooltip
  const tooltip = 'Active Instance tooltip placeholder'
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

  const { usageError, summaryError } = errors
  const { refetchUsage, refetchSummary } = refetches
  if (usageError) {
    return <PageError message={usageError?.message} onClick={refetchUsage} />
  }

  if (summaryError) {
    return <PageError message={summaryError.message} onClick={refetchSummary} />
  }

  return <UsageInfoCard {...props} />
}

interface FeatureFlagsProps {
  featureFlags: number
  refetch: () => void
  error: GetDataError<Failure | Error> | null
}

const FeatureFlags: React.FC<FeatureFlagsProps> = ({ featureFlags, error, refetch }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.purpose.cf.continuous')
  //TO-DO: replace with tooltip
  const tooltip = 'Users tooltip placeholder'
  const rightHeader = getString('common.current')
  const hasBar = false
  const props = { usage: featureFlags, leftHeader, tooltip, rightHeader, hasBar }

  if (error) {
    return <PageError message={error.message} onClick={refetch} />
  }

  return <UsageInfoCard {...props} />
}

const timestamp = moment.now()

const FFUsageInfo: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const {
    data: usageData,
    loading: loadingUsageData,
    error: usageError,
    refetch: refetchUsage
  } = useGetLicenseUsage({
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
    queryParams: { moduleType: ModuleName.CF },
    accountIdentifier: accountId
  })

  const isLoading = loadingUsageData || loadingSummaryData

  if (isLoading) {
    return <ContainerSpinner />
  }

  const summary = summaryData?.data as CFLicenseSummaryDTO

  return (
    <Layout.Horizontal spacing="large">
      <FeatureFlagsUsersCard
        errors={{ usageError, summaryError }}
        refetches={{
          refetchUsage: () => {
            refetchUsage()
          },
          refetchSummary: () => {
            refetchSummary()
          }
        }}
        subscribedUsers={summary.totalClientMAUs || 0}
        activeUsers={usageData?.activeClientMAUs?.count || 0}
        rightHeader={usageData?.activeClientMAUs?.displayName || ''}
      />
      <FeatureFlags featureFlags={summary.totalFeatureFlagUnits || 0} error={summaryError} refetch={refetchSummary} />
    </Layout.Horizontal>
  )
}

export default FFUsageInfo
