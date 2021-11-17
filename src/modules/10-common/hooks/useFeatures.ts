import { capitalize } from 'lodash-es'
import { Editions, RestrictionType } from '@common/constants/SubscriptionTypes'
import { useDeepCompareEffect } from '@common/hooks'
import { useFeaturesContext } from 'framework/featureStore/FeaturesContext'
import type { AvailabilityRestrictionDTO } from 'services/cd-ng'
import { FeatureFlag } from '@common/featureFlags'
import type {
  FeatureRequestOptions,
  FeatureRequest,
  CheckFeatureReturn,
  FeaturesRequest,
  CheckFeaturesReturn,
  ModuleType,
  RestrictionMetadataMap
} from 'framework/featureStore/featureStoreUtil'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useFeatureFlag } from './useFeatureFlag'

interface FeatureProps {
  featureRequest?: FeatureRequest
  options?: FeatureRequestOptions
}

interface FeaturesProps {
  featuresRequest?: FeaturesRequest
  options?: FeatureRequestOptions
}

export function useFeature(props: FeatureProps): CheckFeatureReturn {
  const { requestFeatures, checkFeature, requestLimitFeature, checkLimitFeature, getRestrictionType } =
    useFeaturesContext()
  const { licenseInformation, CI_LICENSE_STATE, CD_LICENSE_STATE, FF_LICENSE_STATE, CCM_LICENSE_STATE } =
    useLicenseStore()

  const featureEnforced = useFeatureFlag(FeatureFlag.FEATURE_ENFORCEMENT_ENABLED)

  const { featureRequest, options } = props
  const restrictionType = getRestrictionType({
    featureRequest,
    licenseInformation,
    licenseState: { CI_LICENSE_STATE, CD_LICENSE_STATE, FF_LICENSE_STATE, CCM_LICENSE_STATE }
  })
  const isLimit = restrictionType && restrictionType !== RestrictionType.AVAILABILITY

  useDeepCompareEffect(() => {
    if (featureEnforced && featureRequest) {
      if (isLimit) {
        requestLimitFeature(featureRequest)
      } else {
        // cache enabled availability feature list in the context
        // restrictionType could be undefined, we don't do anything
        restrictionType && requestFeatures(featureRequest, options)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureRequest, options, isLimit, featureEnforced, restrictionType])

  if (!featureEnforced || featureRequest === undefined) {
    return { enabled: true }
  }

  // rate limit feature always calls the api in real time
  return isLimit ? checkLimitFeature(featureRequest.featureName) : checkFeature(featureRequest.featureName)
}

export function useFeatures(props: FeaturesProps): CheckFeaturesReturn {
  const { requestFeatures, checkFeature, requestLimitFeature, checkLimitFeature, getRestrictionType } =
    useFeaturesContext()
  const { licenseInformation, CI_LICENSE_STATE, CD_LICENSE_STATE, FF_LICENSE_STATE, CCM_LICENSE_STATE } =
    useLicenseStore()

  const featureEnforced = useFeatureFlag(FeatureFlag.FEATURE_ENFORCEMENT_ENABLED)

  const features = new Map<FeatureIdentifier, CheckFeatureReturn>()
  const { featuresRequest, options } = props

  function groupFeatures(): { limitFeatures: FeatureIdentifier[]; availFeatures: FeatureIdentifier[] } {
    const accLimitFeatures: FeatureIdentifier[] = []
    const accAvailFeatures: FeatureIdentifier[] = []
    featuresRequest?.featureNames.forEach(featureName => {
      const restrictionType = getRestrictionType({
        featureRequest: { featureName },
        licenseInformation,
        licenseState: { CI_LICENSE_STATE, CD_LICENSE_STATE, FF_LICENSE_STATE, CCM_LICENSE_STATE }
      })
      const isLimit = restrictionType && restrictionType !== RestrictionType.AVAILABILITY
      if (isLimit) {
        accLimitFeatures.push(featureName)
      } else {
        // restrictionType could be undefined, we don't do anything
        restrictionType && accAvailFeatures.push(featureName)
      }
    })
    return { limitFeatures: accLimitFeatures, availFeatures: accAvailFeatures }
  }
  const { limitFeatures, availFeatures } = groupFeatures()

  useDeepCompareEffect(() => {
    if (featureEnforced && featuresRequest) {
      if (limitFeatures.length > 0) {
        // every limit feature needs real time inquiry
        limitFeatures.forEach(featureName => {
          requestLimitFeature({ featureName })
        })
      }
      if (availFeatures.length > 0) {
        // cache enabled availability feature list in the context
        requestFeatures(featuresRequest, options)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, featureEnforced, limitFeatures, availFeatures])

  if (!featureEnforced) {
    if (featuresRequest) {
      const { featureNames } = featuresRequest
      featureNames.forEach(featureName => {
        features.set(featureName, { enabled: true })
      })
    }
    return { features }
  }

  limitFeatures.forEach(featureName => {
    features.set(featureName, checkLimitFeature(featureName))
  })

  availFeatures.forEach(featureName => {
    features.set(featureName, checkFeature(featureName))
  })

  return { features }
}

export function useFeatureModule(featureName: FeatureIdentifier): ModuleType {
  const { featureMap } = useFeaturesContext()
  return featureMap.get(featureName)?.moduleType
}

export function useFeatureRequiredPlans(featureName: FeatureIdentifier): string[] {
  const { featureMap, getEdition } = useFeaturesContext()
  const { licenseInformation, CI_LICENSE_STATE, CD_LICENSE_STATE, FF_LICENSE_STATE, CCM_LICENSE_STATE } =
    useLicenseStore()
  const moduleType = featureMap.get(featureName)?.moduleType
  const currentEdition = getEdition({
    moduleType,
    licenseInformation,
    licenseState: { CI_LICENSE_STATE, CD_LICENSE_STATE, FF_LICENSE_STATE, CCM_LICENSE_STATE }
  })
  return getRequiredPlans(currentEdition, featureMap.get(featureName)?.restrictionMetadataMap)
}

function getRequiredPlans(currentEdition?: Editions, map?: RestrictionMetadataMap): string[] {
  const editions: string[] = []
  if (!map || !currentEdition) {
    return editions
  }
  Object.entries(map).forEach(([key, value]) => {
    const edition = key as Editions
    if (lowerThanCurrentPlan(currentEdition, edition)) {
      return
    }
    const { enabled } = value as AvailabilityRestrictionDTO
    // for plans when it's AVAILABILITY feature, when enabled is true, push it into the bucket
    // for plans when it's LIMIT feature, enabled is undefined, just push it into the bucket
    if (enabled !== false) {
      editions.push(capitalize(edition.toString()))
    }
  })
  return editions
}

const orders = {
  ENTERPRISE: 0,
  TEAM: 1,
  FREE: 2,
  COMMUNITY: 2
}

function lowerThanCurrentPlan(currentEdition: Editions, edition: Editions): boolean {
  return orders[currentEdition] <= orders[edition]
}
