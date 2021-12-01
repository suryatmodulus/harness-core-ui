import React, { Dispatch, SetStateAction } from 'react'
import cx from 'classnames'
import { Button, ButtonSize, ButtonVariation, Color, Layout, Text, Container } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import routes from '@common/RouteDefinitions'
import type { StringsMap } from 'stringTypes'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useFeatures } from '@common/hooks/useFeatures'
import { useLocalStorage } from '@common/hooks'
import type { CheckFeatureReturn, CheckFeaturesReturn, FeatureDetail } from 'framework/featureStore/featureStoreUtil'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings, UseStringsReturn } from 'framework/strings'
import css from './FeatureRestrictionBannersFactory.module.scss'

interface Dependency {
  [key: string]: { enabled?: boolean }
}

type ModuleToFeatureMapValue = {
  limit?: number
  limitPercent?: number
  limitCrossedMessage?: keyof StringsMap
  upgradeRequiredBanner?: boolean
  dependency?: Dependency
}

interface DisplayBanner {
  featureName: string
  allowed?: boolean
  messageString: string
  upgradeRequiredBanner?: boolean
  isFeatureRestrictionAllowedForModule?: boolean
}

const getBannerDependencyMet = ({
  features,
  featureName,
  dependency
}: {
  featureName?: FeatureIdentifier
  features: Map<FeatureIdentifier, CheckFeatureReturn>
  dependency?: Dependency
}): boolean => {
  if (dependency) {
    const dependencyKeys = Object.entries(dependency)
    // featureName ACTIVE_COMMITTERS featureDetail check is required to show the api finished to prevent banner flicker
    if (
      dependencyKeys?.some(
        ([key, value]) =>
          features.get(key as FeatureIdentifier)?.enabled !== value.enabled ||
          (featureName === FeatureIdentifier.ACTIVE_COMMITTERS &&
            isEmpty(features.get(key as FeatureIdentifier)?.featureDetail || {}))
      )
    ) {
      return false
    }
  }

  return true
}

const getQualifiedEnforcedBanner = ({
  dependencyMet,
  featureDetail,
  uiDisplayBanner,
  getString,
  featureName
}: {
  dependencyMet: boolean
  featureDetail?: FeatureDetail
  uiDisplayBanner: ModuleToFeatureMapValue
  getString: UseStringsReturn['getString']
  featureName: FeatureIdentifier
}): DisplayBanner | undefined => {
  let _isLimitBreached = false
  if (dependencyMet && typeof featureDetail?.count !== 'undefined' && featureDetail.limit) {
    _isLimitBreached =
      typeof uiDisplayBanner?.limit !== 'undefined'
        ? featureDetail.count >= uiDisplayBanner.limit
        : uiDisplayBanner.limitPercent
        ? (featureDetail.count / featureDetail.limit) * 100 >= uiDisplayBanner.limitPercent
        : false

    if (_isLimitBreached) {
      const usagePercent = Math.min(Math.floor((featureDetail.count / featureDetail.limit) * 100), 100)
      const messageString =
        uiDisplayBanner?.limitCrossedMessage &&
        getString(uiDisplayBanner.limitCrossedMessage, {
          usagePercent,
          limit: featureDetail.limit,
          count: featureDetail.count
        })

      if (messageString && featureDetail?.enabled) {
        return {
          featureName,
          isFeatureRestrictionAllowedForModule: featureDetail.enabled,
          upgradeRequiredBanner: uiDisplayBanner.upgradeRequiredBanner,
          messageString
        }
      }
    }
  }
  return undefined
}

const Banner = ({
  banner,
  getString,
  history,
  accountId,
  module,
  setDismissedBanners,
  dismissedBanners
}: {
  banner: DisplayBanner
  getString: UseStringsReturn['getString']
  history: { push: (route: string) => void }
  accountId: string
  module: Module
  setDismissedBanners: Dispatch<SetStateAction<string[]>>
  dismissedBanners: string[]
}): JSX.Element => {
  return (
    <Layout.Horizontal
      key={banner.messageString}
      className={cx(css.bannerContainer, banner.upgradeRequiredBanner && css.upgradeRequiredBanner)}
      flex={{ alignItems: 'center', justifyContent: 'space-between' }}
      background={banner.upgradeRequiredBanner ? '#FFF5ED' : Color.WHITE}
      height={56}
      padding={{ left: 'large', top: 'medium', bottom: 'medium' }}
    >
      <Container flex>
        <Text
          icon={banner.upgradeRequiredBanner ? 'upgrade-bolt' : 'info-message'}
          iconProps={{
            intent: 'primary',
            size: 20,
            margin: { right: 'xsmall' },
            color: banner.upgradeRequiredBanner ? Color.ORANGE_900 : Color.PRIMARY_7
          }}
          font={{ weight: 'semi-bold', size: 'small' }}
          color={Color.PRIMARY_10}
          margin={{ right: 'medium' }}
        >
          {banner.upgradeRequiredBanner && (
            <Text style={{ fontWeight: 700, marginRight: 'var(--spacing-5)' }} color={Color.ORANGE_900}>
              {getString('common.feature.upgradeRequired.title').toUpperCase()}
            </Text>
          )}
          {banner.messageString}
        </Text>
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          width={130}
          onClick={() => {
            history.push(
              routes.toSubscriptions({
                accountId,
                moduleCard: module
              })
            )
          }}
        >
          {getString('common.explorePlans')}
        </Button>
      </Container>
      <Button icon="cross" minimal onClick={() => setDismissedBanners([...dismissedBanners, banner.featureName])} />
    </Layout.Horizontal>
  )
}

export const ModuleToFeatureMap: Record<string, Record<string, ModuleToFeatureMapValue[]>> = {
  cd: {
    SERVICES: []
  },
  ci: {
    MAX_TOTAL_BUILDS: [
      {
        limit: 2250,
        limitCrossedMessage: 'pipeline.featureRestriction.maxTotalBuilds90PercentLimit'
      }
    ],
    MAX_BUILDS_PER_MONTH: [
      {
        limit: 100,
        limitCrossedMessage: 'pipeline.featureRestriction.maxBuildsPerMonth100PercentLimit',
        upgradeRequiredBanner: true,
        dependency: {
          MAX_TOTAL_BUILDS: { enabled: false }
        }
      },
      {
        limit: 0,
        limitCrossedMessage: 'pipeline.featureRestriction.numMonthlyBuilds',
        dependency: {
          MAX_TOTAL_BUILDS: { enabled: false }
        }
        //
      }
    ],
    ACTIVE_COMMITTERS: [
      {
        limitPercent: 100,
        limitCrossedMessage: 'pipeline.featureRestriction.subscriptionExceededLimit',
        upgradeRequiredBanner: true,
        dependency: {
          MAX_TOTAL_BUILDS: { enabled: true },
          MAX_BUILDS_PER_MONTH: { enabled: true }
        }
      },
      {
        limitPercent: 90,
        limitCrossedMessage: 'pipeline.featureRestriction.subscription90PercentLimit',
        dependency: {
          MAX_TOTAL_BUILDS: { enabled: true },
          MAX_BUILDS_PER_MONTH: { enabled: true }
        }
      }
    ]
  },
  cf: {
    SERVICES: []
  },
  cv: {
    SERVICES: []
  },
  ce: {
    SERVICES: []
  }
}

export const getFeatureRestrictionDetailsForModule = (
  module: Module,
  featureIdentifier: FeatureIdentifier
): ModuleToFeatureMapValue[] | undefined => {
  // return the above map value for the supplied module 'key'
  const fromMap = ModuleToFeatureMap[module]
  return fromMap && fromMap[featureIdentifier]
}

interface FeatureRestrictionBannersProps {
  module: Module
  featureNames?: FeatureIdentifier[] // order will determine which banner will appear
  getCustomMessageString?: (features: CheckFeaturesReturn) => string
}

// Show this banner if limit usage is breached for the feature
export const FeatureRestrictionBanners = (props: FeatureRestrictionBannersProps): JSX.Element | null => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()
  const { module, featureNames = [] } = props
  const shownBanners: DisplayBanner[] = []
  const [dismissedBanners, setDismissedBanners] = useLocalStorage<string[]>('dismiss_banners', [])
  const { features } = useFeatures({ featuresRequest: { featureNames } })

  // only 1 banner will be shown for this module
  featureNames.some(featureName => {
    // Get the above map details
    const featureRestrictionModuleDetails = getFeatureRestrictionDetailsForModule(module, featureName)
    const { featureDetail } = features.get(featureName) || {}
    // check for the first message that would appear
    return featureRestrictionModuleDetails?.some((uiDisplayBanner: ModuleToFeatureMapValue) => {
      let bannerAdded = false
      if (
        featureDetail?.enabled === false &&
        featureDetail?.moduleType === module.toUpperCase() &&
        uiDisplayBanner.upgradeRequiredBanner
      ) {
        // when feature is not allowed and upgrade banner should be shown
        // moduleType necessary since sometimes enabled===false and no moduleType exists
        const dependency = uiDisplayBanner?.dependency
        const dependencyMet = getBannerDependencyMet({ features, featureName, dependency })
        const messageString = uiDisplayBanner?.limitCrossedMessage && getString(uiDisplayBanner.limitCrossedMessage)
        if (dependencyMet && messageString) {
          shownBanners.push({
            featureName,
            isFeatureRestrictionAllowedForModule: featureDetail.enabled,
            upgradeRequiredBanner: uiDisplayBanner.upgradeRequiredBanner,
            messageString
          })
        }
        bannerAdded = true
      } else if (featureDetail?.enabled) {
        /*
          Show the banner if
          1. Feature enforcement enabled
          2. If dependency exists and matches
          
          getQualifiedEnforcedBanner
          3. Usage limit | percent uiDisplayBanner is breached
          4. Message is present in the above map value
        */

        const dependency = uiDisplayBanner?.dependency
        const dependencyMet = getBannerDependencyMet({ features, dependency })
        const addBanner = getQualifiedEnforcedBanner({
          dependencyMet,
          featureDetail,
          uiDisplayBanner,
          getString,
          featureName
        })
        if (addBanner) {
          shownBanners.push(addBanner)
          bannerAdded = true
        }
      }
      return bannerAdded
    })
  })

  if (shownBanners.length) {
    return (
      <>
        {shownBanners
          .filter(shownBanner => !dismissedBanners.includes(shownBanner?.featureName))
          .map(banner => (
            <Banner
              key={banner?.messageString}
              banner={banner}
              getString={getString}
              history={history}
              accountId={accountId}
              module={module}
              setDismissedBanners={setDismissedBanners}
              dismissedBanners={dismissedBanners}
            />
          ))}
      </>
    )
  }
  return null
}
