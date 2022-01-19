/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
// import { ModuleName } from 'framework/types/ModuleName'
import FeatureWarningSubscriptionInfoBanner from '@common/components/FeatureWarning/FeatureWarningSubscriptionInfoBanner'
import FeatureWarningSubscriptionUpgradeBanner from '@common/components/FeatureWarning/FeatureWarningSubscriptionUpgradeBanner'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
// import { useStrings } from 'framework/strings'
// eslint-disable-next-line no-restricted-imports
// import { useGetUsageAndLimit } from '@auth-settings/hooks/useGetUsageAndLimit'

const UsageLimitBanner = (): ReactElement => {
  //   const { getString } = useStrings()
  //   const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CF)
  const license = useLicenseStore()

  const isTeamOrEnterpriseSubscription =
    license.licenseInformation.CF?.edition === 'ENTERPRISE' || license.licenseInformation.CF?.edition === 'TEAM'

  //   const developerUsageCount = Number(usageData.usage?.ff?.activeFeatureFlagUsers?.count)
  const developerUsageCount = 100
  const developerPlanLimit = 100
  //   const developerPlanLimit = Number(limitData.limit?.ff?.totalFeatureFlagUnits)

  const developerUsagePercentage = Math.trunc((developerUsageCount / developerPlanLimit) * 100)

  const showInfoBanner =
    isTeamOrEnterpriseSubscription &&
    developerPlanLimit > 0 &&
    developerUsagePercentage >= 90 &&
    developerUsagePercentage < 100

  const showWarningBanner = isTeamOrEnterpriseSubscription && developerPlanLimit > 0 && developerUsagePercentage >= 100

  return (
    <>
      {isTeamOrEnterpriseSubscription && (
        <>
          {showInfoBanner && (
            <FeatureWarningSubscriptionInfoBanner
              featureName={FeatureIdentifier.DEVELOPERS}
              //   message={getString('cf.planEnforcement.teamEnterprisePlan.approachingLimit')}
              message="sdsdfsdfsdf"
            />
          )}
          {showWarningBanner && (
            <FeatureWarningSubscriptionUpgradeBanner
              featureName={FeatureIdentifier.DEVELOPERS}
              //   message={getString('cf.planEnforcement.teamEnterprisePlan.upgradeRequired')}
              message="sdsdfsdfsdf"
            />
          )}
        </>
      )}
    </>
  )
}

export default UsageLimitBanner
