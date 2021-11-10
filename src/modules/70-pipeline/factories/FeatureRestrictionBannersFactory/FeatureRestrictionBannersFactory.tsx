import React from 'react'
import cx from 'classnames'
import { Button, ButtonSize, ButtonVariation, Color, Layout, Text, Container } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import type { StringsMap } from 'stringTypes'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useFeatures } from '@common/hooks/useFeatures'
import { useLocalStorage } from '@common/hooks'

import type { CheckFeaturesReturn } from 'framework/featureStore/FeaturesContext'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import css from './FeatureRestrictionBannersFactory.module.scss'

type ModuleToFeatureMapValue = {
  limit?: number
  limitPercent?: number
  limitCrossedMessage?: keyof StringsMap
  upgradeRequiredBanner?: boolean
}

interface DisplayBanner {
  featureName: string
  allowed?: boolean
  messageString: string
  upgradeRequiredBanner?: boolean
  isFeatureRestrictionAllowedForModule?: boolean
}
export const ModuleToFeatureMap: Record<string, Record<string, ModuleToFeatureMapValue[]>> = {
  cd: {
    SERVICES: [{ limit: 90, limitCrossedMessage: 'pipeline.featureRestriction.serviceLimitExceeded' }]
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
        upgradeRequiredBanner: true
      },
      {
        limit: 1,
        limitCrossedMessage: 'pipeline.featureRestriction.numMonthlyBuilds'
      }
    ],
    ACTIVE_COMMITTERS: [
      {
        limitPercent: 100,
        limitCrossedMessage: 'pipeline.featureRestriction.subscriptionExceededLimit',
        upgradeRequiredBanner: true
      },
      {
        limitPercent: 90,
        limitCrossedMessage: 'pipeline.featureRestriction.subscription90PercentLimit'
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
export const FeatureRestrictionBanners = (
  props: FeatureRestrictionBannersProps
): JSX.Element | (JSX.Element | null)[] | null => {
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
      if (featureDetail?.enabled === false && uiDisplayBanner.upgradeRequiredBanner) {
        // when feature is not allowed and upgrade banner should be shown
        const messageString = uiDisplayBanner?.limitCrossedMessage && getString(uiDisplayBanner.limitCrossedMessage)
        if (messageString) {
          shownBanners.push({
            featureName,
            isFeatureRestrictionAllowedForModule: featureDetail.enabled,
            upgradeRequiredBanner: uiDisplayBanner.upgradeRequiredBanner,
            messageString
          })
        }
        return true
      } else if (featureDetail?.enabled) {
        /*
          Show the banner if
          1. Feature enforcement enabled
          2. Usage limit | percent uiDisplayBanner is breached
          3. Message is present in the above map value
        */
        let _isLimitBreached = false
        if (featureDetail?.count && featureDetail.limit) {
          _isLimitBreached = uiDisplayBanner?.limit
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
              shownBanners.push({
                featureName,
                isFeatureRestrictionAllowedForModule: featureDetail.enabled,
                upgradeRequiredBanner: uiDisplayBanner.upgradeRequiredBanner,
                messageString
              })
            }
            return true
          }
        }
      } else {
        // no banners to show
        return false
      }
    })
  })

  if (shownBanners.length) {
    return shownBanners
      .filter(shownBanner => !dismissedBanners.includes(shownBanner?.featureName))
      .map(banner => (
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
      ))
  }
  return null
}
