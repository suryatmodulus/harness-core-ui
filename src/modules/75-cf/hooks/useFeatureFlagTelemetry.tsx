/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
