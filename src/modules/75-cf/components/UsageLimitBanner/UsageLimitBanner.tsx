import React, { ReactElement } from 'react'
import FeatureWarningUpgradeBanner from '@common/components/FeatureWarning/FeatureWarningUpgradeBanner'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useGetUsageAndLimit } from '@auth-settings/hooks/useGetUsageAndLimit'
import { ModuleName } from 'framework/types/ModuleName'
import FeatureWarningSubscriptionInfoBanner from '@common/components/FeatureWarning/FeatureWarningSubscriptionInfoBanner'
import FeatureWarningInfoBanner from '@common/components/FeatureWarning/FeatureWarningInfoBanner'
import FeatureWarningSubscriptionUpgradeBanner from '@common/components/FeatureWarning/FeatureWarningSubscriptionUpgradeBanner'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { formatToCompactNumber } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'

const UsageLimitBanner = (): ReactElement => {
  const { getString } = useStrings()
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CF)
  const license = useLicenseStore()

  const isFreeSubscription = license.licenseInformation.CF?.edition === 'FREE'

  const isTeamOrEnterpriseSubscription =
    license.licenseInformation.CF?.edition === 'ENTERPRISE' || license.licenseInformation.CF?.edition === 'TEAM'

  const clientMauUsageCount = Number(usageData.usage?.ff?.activeClientMAUs?.count)

  const clientMauPlanLimit = Number(limitData.limit?.ff?.totalClientMAUs)

  const clientMauUsagePercentage = Math.trunc((clientMauUsageCount / clientMauPlanLimit) * 100)
  const clientMauPlanLimitFormatted = formatToCompactNumber(clientMauPlanLimit)

  const showInfoBanner = clientMauUsagePercentage >= 90 && clientMauUsagePercentage < 100
  const showWarningBanner = clientMauUsagePercentage >= 100

  return (
    <>
      {isFreeSubscription && (
        <>
          {showInfoBanner && (
            <FeatureWarningInfoBanner
              featureName={FeatureIdentifier.MAUS}
              message={getString('cf.planEnforcement.freePlan.approachingLimit', {
                clientMauUsagePercentage,
                clientMauPlanLimitFormatted
              })}
            />
          )}
          {showWarningBanner && (
            <FeatureWarningUpgradeBanner
              featureName={FeatureIdentifier.MAUS}
              message={getString('cf.planEnforcement.freePlan.upgradeRequired', { clientMauPlanLimitFormatted })}
            />
          )}
        </>
      )}

      {isTeamOrEnterpriseSubscription && (
        <>
          {showInfoBanner && (
            <FeatureWarningSubscriptionInfoBanner
              featureName={FeatureIdentifier.DEVELOPERS}
              message={getString('cf.planEnforcement.teamEnterprisePlan.approachingLimit', {
                clientMauUsagePercentage
              })}
            />
          )}
          {showWarningBanner && (
            <FeatureWarningSubscriptionUpgradeBanner
              featureName={FeatureIdentifier.DEVELOPERS}
              message={getString('cf.planEnforcement.teamEnterprisePlan.upgradeRequired')}
            />
          )}
        </>
      )}
    </>
  )
}

export default UsageLimitBanner
