import { useTelemetry } from '@common/hooks/useTelemetry'
import { ModuleName } from 'framework/types/ModuleName'

interface FeatureFlagTelementary {
  visitedPage: () => void
  createFeatureFlagStart: () => void
  createFeatureFlagCompleted: () => void
}

const EVENT_TYPE = {
  VISITED_LANDING_PAGE: 'Visited feature flag landing page',
  CREATE_FEATURE_FLAG_START: 'Started creating feature flag',
  CREATE_FEATURE_FLAG_COMPLETE: 'Successfully created feature flag'
}

export const useFeatureFlagTelemetry = (): FeatureFlagTelementary => {
  const { trackEvent } = useTelemetry()

  const visitedPage = (): void => trackEvent(EVENT_TYPE.VISITED_LANDING_PAGE, { module: ModuleName.CF })
  const createFeatureFlagStart = (): void => trackEvent(EVENT_TYPE.CREATE_FEATURE_FLAG_START, { module: ModuleName.CF })
  const createFeatureFlagCompleted = (): void =>
    trackEvent(EVENT_TYPE.CREATE_FEATURE_FLAG_COMPLETE, { module: ModuleName.CF })

  return { visitedPage, createFeatureFlagStart, createFeatureFlagCompleted }
}
