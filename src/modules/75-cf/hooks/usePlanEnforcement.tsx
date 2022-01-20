/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'

interface UsePlanEnforcement {
  isPlanEnforcementEnabled: boolean
  isFreePlan: boolean
}

const usePlanEnforcement = (): UsePlanEnforcement => {
  const { FFM_1859, FEATURE_ENFORCEMENT_ENABLED } = useFeatureFlags()
  const license = useLicenseStore()

  const isFreePlan = license.licenseInformation.CF?.edition === 'FREE'

  return {
    isPlanEnforcementEnabled: !!(FFM_1859 && FEATURE_ENFORCEMENT_ENABLED),
    isFreePlan
  }
}

export default usePlanEnforcement
