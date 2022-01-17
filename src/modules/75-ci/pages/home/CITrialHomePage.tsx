/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useStrings } from 'framework/strings'
import { StartTrialTemplate } from '@rbac/components/TrialHomePageTemplate/StartTrialTemplate'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { PageNames } from '@ci/constants/TrackingConstants'
import { Category } from '@common/constants/TrackingConstants'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import bgImageURL from './images/ci.svg'

const CITrialHomePage: React.FC = () => {
  const { getString } = useStrings()

  useTelemetry({ pageName: PageNames.CIStartTrial, category: Category.SIGNUP })

  const isFreeEnabled = useFeatureFlag(FeatureFlag.FREE_PLAN_ENABLED)
  const startBtnDescription = isFreeEnabled
    ? getString('common.startFreePlan', { module: 'CI' })
    : getString('ci.ciTrialHomePage.startTrial.startBtn.description')

  const startTrialProps = {
    description: getString('ci.ciTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('ci.learnMore'),
      url: 'https://ngdocs.harness.io/category/zgffarnh1m-ci-category'
    },
    startBtn: {
      description: startBtnDescription
    }
  }

  return (
    <StartTrialTemplate
      title={getString('ci.continuous')}
      bgImageUrl={bgImageURL}
      startTrialProps={startTrialProps}
      module="ci"
    />
  )
}

export default CITrialHomePage
