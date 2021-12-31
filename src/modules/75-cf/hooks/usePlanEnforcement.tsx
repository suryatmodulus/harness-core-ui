import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

interface UsePlanEnforcement {
  isPlanEnforcementEnabled: boolean
}

const usePlanEnforcement = (): UsePlanEnforcement => {
  const { FFM_1859, FEATURE_ENFORCEMENT_ENABLED } = useFeatureFlags()

  return {
    isPlanEnforcementEnabled: !!(FFM_1859 && FEATURE_ENFORCEMENT_ENABLED)
  }
}

export default usePlanEnforcement
