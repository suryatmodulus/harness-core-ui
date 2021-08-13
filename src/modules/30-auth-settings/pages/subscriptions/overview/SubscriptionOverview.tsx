import React from 'react'

import { Layout } from '@wings-software/uicore'
import type { ModuleName } from 'framework/types/ModuleName'

import type { ModuleLicenseDTO } from 'services/cd-ng'
import SubscriptionDetailsCard from './SubscriptionDetailsCard'
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
      {/* TO-DO: uncomment this when integrate with subscription data api */}
      {/* {licenseData && <SubscriptionUsageCard module={module} />} */}
    </Layout.Vertical>
  )
}

export default SubscriptionOverview
