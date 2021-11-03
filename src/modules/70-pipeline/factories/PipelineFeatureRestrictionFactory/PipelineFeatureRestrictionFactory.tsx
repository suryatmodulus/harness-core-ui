import React from 'react'
import { Button, ButtonSize, ButtonVariation, Color, Layout, Text } from '@wings-software/uicore'
import type { StringsMap } from 'stringTypes'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useFeatures } from '@common/hooks/useFeatures'
import type { CheckFeaturesReturn } from 'framework/featureStore/FeaturesContext'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'

type ModuleToFeatureMapValue = { allowed: boolean; limit?: number; limitCrossedMessage?: keyof StringsMap }

export const ModuleToFeatureMap: Record<string, Record<string, ModuleToFeatureMapValue>> = {
  cd: {
    SERVICES: { allowed: true, limit: 90, limitCrossedMessage: 'pipeline.featureRestriction.serviceLimitExceeded' }
  },
  ci: {
    MAX_TOTAL_BUILDS: {
      allowed: true,
      limit: 90,
      limitCrossedMessage: 'pipeline.featureRestriction.maxTotalBuilds90Limit'
    },
    MAX_BUILDS_PER_MONTH: {
      allowed: true,
      limit: 90,
      limitCrossedMessage: 'pipeline.featureRestriction.maxBuildsPerMonth90Limit'
    }
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
  featureNames?: FeatureIdentifier[] // multiple conditions to check
  getCustomMessageString?: (features: CheckFeaturesReturn) => string
}

// Show this banner if limit usage is breached for the feature
export const PipelineFeatureLimitBreachedBanner = (props: PipelineFeatureRestrictionBannerProps) => {
  const { getString } = useStrings()

  // This allowed boolean is set in the UI. Currently, we just set it for 'SERVICES' feature in CD module
  let isFeatureRestrictionAllowedForModule
  let limitBreached
  let messageString
  const featureNames = props.featureNames ? props.featureNames : [props.featureIdentifier]

  // Get the feature usages, and the limit details from GTM hook
  const { features } = useFeatures({ featuresRequest: { featureNames } })

  limitBreached = featureNames.some(featureName => {
    // Get the above map details
    const featureRestrictionModuleDetails = getFeatureRestrictionDetailsForModule(props.module, featureName)
    const { featureDetail } = features.get(featureName) || {}
    const featureDetailsLimit = featureDetail?.limit
    limitBreached = featureDetailsLimit
      ? featureDetailsLimit > (featureRestrictionModuleDetails?.limit || 1000000)
      : false
    if (limitBreached) {
      isFeatureRestrictionAllowedForModule = featureRestrictionModuleDetails?.allowed
      messageString = featureRestrictionModuleDetails?.limitCrossedMessage
    }
    return limitBreached
  })

  /*
  Show the banner if
  1. Feature is restricted in the module and
  2. Usage limit is breached
  3. Message is present in the above map value
  */
  const showBanner = isFeatureRestrictionAllowedForModule && limitBreached && messageString
  return showBanner ? (
    <Layout.Horizontal
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      background={Color.BLUE_50}
      height={56}
      padding={{ left: 'large', top: 'medium', bottom: 'medium' }}
    >
      <Text
        icon="info-sign"
        iconProps={{ intent: 'primary', size: 16, margin: { right: 'medium' } }}
        font={{ weight: 'semi-bold', size: 'small' }}
        color={Color.PRIMARY_10}
        margin={{ right: 'medium' }}
      >
        {messageString}
      </Text>
      <Button variation={ButtonVariation.SECONDARY} size={ButtonSize.SMALL}>
        {getString('common.viewUsage')}
      </Button>
    </Layout.Horizontal>
  ) : null
}
