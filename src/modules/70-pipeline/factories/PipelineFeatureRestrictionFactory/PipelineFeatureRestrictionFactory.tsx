/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Button, ButtonSize, ButtonVariation, Color, Container, Icon, Text } from '@wings-software/uicore'
import type { StringsMap } from 'stringTypes'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useFeature } from '@common/hooks/useFeatures'
import type { FeatureDetail } from 'framework/featureStore/featureStoreUtil'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import css from './PipelineFeatureRestrictionFactory.module.scss'

const WARNING_LIMIT_PERCENT = 90

type ModuleToFeatureMapValue = {
  allowed: boolean
  limitCrossedMessage?: keyof StringsMap
  warningMessage?: keyof StringsMap
}

const ModuleToFeatureMap: Record<string, Record<string, ModuleToFeatureMapValue>> = {
  cd: {
    SERVICES: {
      allowed: true,
      limitCrossedMessage: 'pipeline.featureRestriction.serviceLimitExceeded',
      warningMessage: 'pipeline.featureRestriction.serviceUsageWarning'
    },
    DEPLOYMENTS_PER_MONTH: {
      allowed: true,
      limitCrossedMessage: 'pipeline.featureRestriction.monthlyDeploymentLimitExceeded',
      warningMessage: 'pipeline.featureRestriction.monthlyDeploymentWarning'
    },
    INITIAL_DEPLOYMENTS: {
      allowed: true,
      limitCrossedMessage: 'pipeline.featureRestriction.initialDeploymentLimitExceeded',
      warningMessage: 'pipeline.featureRestriction.initialDeploymentWarning'
    }
  },
  ci: {
    SERVICES: { allowed: false }
  },
  cf: {
    SERVICES: { allowed: false }
  },
  cv: {
    SERVICES: { allowed: false }
  },
  ce: {
    SERVICES: { allowed: false }
  }
}

export const getFeatureRestrictionDetailsForModule = (
  module: Module,
  featureIdentifier: FeatureIdentifier
): ModuleToFeatureMapValue | undefined => {
  // return the above map value for the supplied module 'key'
  const fromMap = ModuleToFeatureMap[module]
  return fromMap && fromMap[featureIdentifier]
}

interface PipelineFeatureRestrictionBannerProps {
  module: Module
  featureIdentifier: FeatureIdentifier
}

interface BannerProps extends PipelineFeatureRestrictionBannerProps {
  featureRestrictionModuleDetails: ModuleToFeatureMapValue
}

const isLimitBreached = (featureDetail?: FeatureDetail): boolean =>
  !!(featureDetail?.count && featureDetail?.limit && featureDetail.count >= featureDetail.limit)

/*
    show warning if
    1. limit is not breached
    2. count is more than warning limit percent
  */
const isWarningShown = (featureDetail?: FeatureDetail, limitBreached?: boolean): boolean =>
  !!(
    !limitBreached &&
    featureDetail?.count &&
    featureDetail?.limit &&
    featureDetail.count >= (featureDetail.limit * WARNING_LIMIT_PERCENT) / 100
  )

const getMessageString = (
  showWarning: boolean,
  limitBreached: boolean,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  featureRestrictionModuleDetails?: ModuleToFeatureMapValue
): string => {
  if (showWarning && featureRestrictionModuleDetails?.warningMessage) {
    return getString(featureRestrictionModuleDetails.warningMessage, { warningLimit: WARNING_LIMIT_PERCENT })
  } else if (limitBreached && featureRestrictionModuleDetails?.limitCrossedMessage) {
    return getString(featureRestrictionModuleDetails.limitCrossedMessage)
  }
  return ''
}

export const Banner = (bannerProps: BannerProps) => {
  const history = useHistory()
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  // Get the feature usages, and the limit details from GTM hook
  const { featureDetail } = useFeature({ featureRequest: { featureName: bannerProps.featureIdentifier } })

  const limitBreached = isLimitBreached(featureDetail)
  const showWarning = isWarningShown(featureDetail, limitBreached)
  const messageString = getMessageString(
    showWarning,
    limitBreached,
    getString,
    bannerProps.featureRestrictionModuleDetails
  )
  /*
  Show the banner if
  1. Usage limit is breached or warning needs to be shown
  2. Message is present in the above map value
  */
  const showBanner =
    (limitBreached || showWarning) && messageString && bannerProps.featureRestrictionModuleDetails?.allowed
  return showBanner ? (
    <Container
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      className={limitBreached ? css.limitBreachedBanner : css.warningBanner}
      height={56}
      padding={{ left: 'large', top: 'medium', bottom: 'medium' }}
    >
      <Icon
        name={limitBreached ? 'upgrade-bolt' : 'info-sign'}
        size={18}
        intent={limitBreached ? 'warning' : 'primary'}
      />
      {limitBreached ? (
        <Text
          font={{ size: 'small', weight: 'bold' }}
          margin={{ left: 'small', right: 'small' }}
          color={Color.ORANGE_900}
        >
          {getString('common.feature.upgradeRequired.title').toUpperCase()}
        </Text>
      ) : null}

      <Text font={{ size: 'small', weight: 'semi-bold' }} margin={{ left: 'small', right: 'small' }}>
        {messageString}
      </Text>
      <Button
        variation={ButtonVariation.SECONDARY}
        size={ButtonSize.SMALL}
        width={130}
        onClick={() => {
          history.push(
            routes.toSubscriptions({
              accountId,
              moduleCard: bannerProps.module
            })
          )
        }}
      >
        {getString('common.explorePlans')}
      </Button>
    </Container>
  ) : null
}

// Show this banner if limit usage is breached for the feature or close to warning limit
export const PipelineFeatureLimitBreachedBanner = (props: PipelineFeatureRestrictionBannerProps) => {
  // Get the above map details
  const featureRestrictionModuleDetails = getFeatureRestrictionDetailsForModule(props.module, props.featureIdentifier)

  // This allowed boolean is set in the UI. if the module doesn't support this feature restriction, return from here
  // Example, CI shouldnot make the call for 'SERVICES', as per the ModuleToFeatureMap
  if (!featureRestrictionModuleDetails?.allowed) {
    return null
  }
  return <Banner {...props} featureRestrictionModuleDetails={featureRestrictionModuleDetails} />
}
