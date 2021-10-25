import React from 'react'
import { StartTrialTemplate } from '@rbac/components/TrialHomePageTemplate/StartTrialTemplate'
import { useStrings } from 'framework/strings'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import bgImageURL from './ff.svg'

const CFTrialHomePage: React.FC = () => {
  const { getString } = useStrings()

  const isFreeEnabled = useFeatureFlag(FeatureFlag.FREE_PLAN_ENABLED)

  const startBtnDescription = isFreeEnabled
    ? getString('common.startFreePlan', { module: 'FF' })
    : getString('cf.cfTrialHomePage.startTrial.startBtn.description')

  const startTrialProps = {
    description: getString('cf.cfTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('cf.learnMore'),
      url: 'https://ngdocs.harness.io/article/0a2u2ppp8s-getting-started-with-continuous-features'
    },
    startBtn: {
      description: startBtnDescription
    }
  }

  return (
    <StartTrialTemplate
      title={getString('cf.continuous')}
      bgImageUrl={bgImageURL}
      startTrialProps={startTrialProps}
      module="cf"
    />
  )
}

export default CFTrialHomePage
