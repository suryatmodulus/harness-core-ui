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
  allowed: boolean
  limit?: number
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
    SERVICES: [{ allowed: true, limit: 90, limitCrossedMessage: 'pipeline.featureRestriction.serviceLimitExceeded' }]
  },
  ci: {
    MAX_TOTAL_BUILDS: [
      {
        allowed: true,
        limit: 2500,
        limitCrossedMessage: 'pipeline.featureRestriction.maxTotalBuilds100PercentLimit'
      },
      {
        allowed: true,
        limit: 2250,
        limitCrossedMessage: 'pipeline.featureRestriction.maxTotalBuilds90PercentLimit'
      }
    ],
    MAX_BUILDS_PER_MONTH: [
      {
        allowed: true,
        limit: 100,
        limitCrossedMessage: 'pipeline.featureRestriction.maxBuildsPerMonth100PercentLimit',
        upgradeRequiredBanner: true
      },
      {
        allowed: true,
        limit: 1,
        limitCrossedMessage: 'pipeline.featureRestriction.numMonthlyBuilds'
      }
    ]
  },
  cf: {
    SERVICES: [{ allowed: false }]
  },
  cv: {
    SERVICES: [{ allowed: false }]
  },
  ce: {
    SERVICES: [{ allowed: false }]
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
  featureIdentifier: FeatureIdentifier
  featureNames?: FeatureIdentifier[] // multiple conditions to check
  getCustomMessageString?: (features: CheckFeaturesReturn) => string
}

// Show this banner if limit usage is breached for the feature
export const FeatureRestrictionBanners = (props: FeatureRestrictionBannersProps): JSX.Element => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()
  const { module } = props
  // ! Use if we want dismiss
  const shownBanners: DisplayBanner[] = []
  const [dismissedBanners, setDismissedBanners] = useLocalStorage<string[]>('dismiss_banners', [])

  // This allowed boolean is set in the UI. Currently, we just set it for 'SERVICES' feature in CD module
  // let isFeatureRestrictionAllowedForModule
  // let limitBreached
  let messageString
  const featureNames = props.featureNames ? props.featureNames : [props.featureIdentifier]
  // Get the feature usages, and the limit details from GTM hook
  const { features } = useFeatures({ featuresRequest: { featureNames } })

  featureNames.forEach(featureName => {
    // Get the above map details
    const featureRestrictionModuleDetails = getFeatureRestrictionDetailsForModule(module, featureName)
    const { featureDetail } = features.get(featureName) || {}
    // hardcode for testing purposes
    // !check for MAX_BUILDSPERMONTH FIRST, if true, don't check monthly
    // ! Currently we are checking both and showing all
    if (featureName === 'MAX_BUILDS_PER_MONTH' && featureDetail) {
      featureDetail.count = 1 // threshold is 2250 for 90% show error
    }
    if (featureName === 'MAX_TOTAL_BUILDS' && featureDetail) {
      featureDetail.count = 2500 // threshold is 2250 for 90% show error
    }
    // !change to forEach if we need to save more than 1 banner**
    return featureRestrictionModuleDetails?.some((featureRestriction: ModuleToFeatureMapValue) => {
      const _isLimitBreached =
        featureDetail?.count && featureRestriction?.limit ? featureDetail.count >= featureRestriction.limit : false

      if (_isLimitBreached && featureDetail?.count && featureDetail?.limit) {
        const usagePercent = Math.min(Math.floor((featureDetail.count / featureDetail.limit) * 100), 100)

        // isFeatureRestrictionAllowedForModule = featureRestriction?.allowed
        messageString =
          featureRestriction?.limitCrossedMessage &&
          getString(featureRestriction.limitCrossedMessage, {
            usagePercent,
            limit: featureDetail.limit,
            count: featureDetail.count
          })
        if (messageString) {
          shownBanners.push({
            featureName,
            isFeatureRestrictionAllowedForModule: featureRestriction.allowed,
            upgradeRequiredBanner: featureRestriction.upgradeRequiredBanner,
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
  // const showBanner =
  //   isFeatureRestrictionAllowedForModule &&
  //   limitBreached &&
  //   messageString &&
  //   !dismissedBanners.includes('MAX_BUILDS_PER_MONTH')
  return (
    shownBanners?.map(
      banner =>
        banner.isFeatureRestrictionAllowedForModule && (
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
              onClick={() => setDismissedBanners([...dismissedBanners, 'MAX_BUILDS_PER_MONTH'])}
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
