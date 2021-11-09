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
  // allowed: boolean // i believe this allowed is powered by FeatureContext
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
        limit: 2500, // edge case where backend is 2600 but it should be 2500
        limitCrossedMessage: 'pipeline.featureRestriction.maxTotalBuilds100PercentLimit'
      },
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
  featureNames?: FeatureIdentifier[] // multiple conditions to check
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

  // only 1 banner will be shown per module
  featureNames.forEach(featureName => {
    // Get the above map details
    const featureRestrictionModuleDetails = getFeatureRestrictionDetailsForModule(module, featureName)
    const { featureDetail } = features.get(featureName) || {}
    // hardcode for testing purposes
    // if (featureName === 'MAX_BUILDS_PER_MONTH' && featureDetail) {
    //   featureDetail.count = 1 // threshold is 2250 for 90% show error
    // }
    if (featureName === 'ACTIVE_COMMITTERS' && featureDetail) {
      featureDetail.count = 201 // threshold is 2250 for 90% show error
    }
    // check for the first message that would appear
    return featureRestrictionModuleDetails?.some((uiDisplayBanner: ModuleToFeatureMapValue) => {
      let _isLimitBreached = false
      if (featureDetail?.count && featureDetail.limit) {
        _isLimitBreached = uiDisplayBanner?.limit
          ? featureDetail.count >= uiDisplayBanner.limit
          : uiDisplayBanner.limitPercent
          ? (featureDetail.count / featureDetail.limit) * 100 >= uiDisplayBanner.limitPercent
          : false
      }

      if (_isLimitBreached && featureDetail?.count && featureDetail?.limit) {
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
      }
      return _isLimitBreached
    })
  })

  /*
  Show the banner if
  1. Feature is restricted in the module and
  2. Usage limit is breached
  3. Message is present in the above map value
  */

  return (
    shownBanners?.map(
      banner =>
        banner.isFeatureRestrictionAllowedForModule &&
        !dismissedBanners.includes(banner.featureName) && (
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
                icon={banner.upgradeRequiredBanner ? 'lightbulb' : 'info-sign'}
                iconProps={{ intent: 'primary', size: 16, margin: { right: 'medium' } }}
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
            {/* Won't be available until View Usage page is ready */}
            {/* <Button variation={ButtonVariation.SECONDARY} size={ButtonSize.SMALL}>
        {getString('common.viewUsage')}
      </Button> */}
            <Button
              icon="cross"
              minimal
              onClick={() => setDismissedBanners([...dismissedBanners, banner.featureName])}
            />
          </Layout.Horizontal>
        )
    ) || null
  )
  // return showBanner ? (
  //   <Layout.Horizontal
  //     className={css.bannerContainer}
  //     flex={{ alignItems: 'center', justifyContent: 'space-between' }}
  //     background={requiresUpgradeBanner ? Color.ORANGE_50 : Color.WHITE}
  //     height={56}
  //     padding={{ left: 'large', top: 'medium', bottom: 'medium' }}
  //   >
  //     <Container flex>
  //       <Text
  //         icon={requiresUpgradeBanner ? 'lightbulb' : 'info-sign'}
  //         iconProps={{ intent: 'primary', size: 16, margin: { right: 'medium' } }}
  //         font={{ weight: 'semi-bold', size: 'small' }}
  //         color={Color.PRIMARY_10}
  //         margin={{ right: 'medium' }}
  //       >
  //         {messageString}
  //       </Text>
  //       <Button
  //         variation={ButtonVariation.SECONDARY}
  //         size={ButtonSize.SMALL}
  //         width={130}
  //         onClick={() => {
  //           history.push(
  //             routes.toSubscriptions({
  //               accountId,
  //               moduleCard: module
  //             })
  //           )
  //         }}
  //       >
  //         {getString('common.explorePlans')}
  //       </Button>
  //     </Container>
  //     {/* Won't be available until View Usage page is ready */}
  //     {/* <Button variation={ButtonVariation.SECONDARY} size={ButtonSize.SMALL}>
  //       {getString('common.viewUsage')}
  //     </Button> */}
  //     <Button icon="cross" minimal onClick={() => setDismissedBanners([...dismissedBanners, 'MAX_BUILDS_PER_MONTH'])} />
  //   </Layout.Horizontal>
  // ) : null
}
