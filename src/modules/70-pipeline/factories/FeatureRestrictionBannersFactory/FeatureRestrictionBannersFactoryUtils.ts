/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import type { StringsMap } from 'stringTypes'
import type { CheckFeatureReturn, FeatureDetail } from 'framework/featureStore/featureStoreUtil'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type {
  FeatureWarningTheme,
  DisplayBanner,
  RedirectButton
} from '@common/components/FeatureWarning/FeatureWarningCommonBannerUtils'
import type { UseStringsReturn } from 'framework/strings'

interface Dependency {
  [key: string]: { enabled?: boolean }
}

export type ModuleToFeatureMapValue = {
  theme: FeatureWarningTheme
  bannerKey: string
  limitCrossedMessage: keyof StringsMap
  limit?: number
  limitPercent?: number
  dependency?: Dependency
  redirectButtons?: RedirectButton[]
}

export const getBannerDependencyMet = ({
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

export const getQualifiedEnforcedBanner = ({
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
          theme: uiDisplayBanner.theme,
          redirectButtons: uiDisplayBanner.redirectButtons,
          bannerKey: uiDisplayBanner.bannerKey,
          messageString
        }
      }
    }
  }
  return undefined
}
