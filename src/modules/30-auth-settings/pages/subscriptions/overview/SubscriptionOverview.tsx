import React from 'react'

import { Layout } from '@wings-software/uicore'
import type { ModuleName } from 'framework/types/ModuleName'

import type { ModuleLicenseDTO } from 'services/cd-ng'
import SubscriptionDetailsCard from './SubscriptionDetailsCard'
import SubscriptionUsageCard from './SubscriptionUsageCard'
import type { TrialInformation } from '../SubscriptionsPage'

interface SubscriptionOverviewProps {
  accountName?: string
  licenseData?: ModuleLicenseDTO
  module: ModuleName
  trialInformation: TrialInformation
  refetchGetLicense?: () => void
}

const SubscriptionOverview: React.FC<SubscriptionOverviewProps> = props => {
  const { accountName, licenseData, module, trialInformation, refetchGetLicense } = props

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

  // Although this component currently contains 'almost' nothing
  // it will be useful to leave this here for other components in the future
  return (
    <Layout.Vertical spacing="large" width={'90%'}>
      <SubscriptionDetailsCard
        accountName={accountName}
        module={module}
        licenseData={licenseData}
        trialInformation={trialInformation}
        refetchGetLicense={refetchGetLicense}
      />
      {licenseData && (
        <SubscriptionUsageCard
          module={module}
          cdUsageInfoProps={cdUsageInfoProps}
          ciUsageInfoProps={ciUsageInfoProps}
          ffUsageInfoProps={ffUsageInfoProps}
          ccmUsageInfoProps={ccmUsageInfoProps}
        />
      )}
    </Layout.Vertical>
  )
}

export default SubscriptionOverview
