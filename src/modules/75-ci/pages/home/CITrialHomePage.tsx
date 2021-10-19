import React from 'react'
import { useStrings } from 'framework/strings'
import StartPlanTemplate from '@rbac/components/HomePageTemplate/StartPlanTemplate'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { PageNames } from '@ci/constants/TrackingConstants'
import { Category } from '@common/constants/TrackingConstants'
import bgImageURL from './images/ci.svg'

const CITrialHomePage: React.FC = () => {
  const { getString } = useStrings()

  useTelemetry({ pageName: PageNames.CIStartTrial, category: Category.SIGNUP })

  const startTrialProps = {
    description: getString('ci.ciTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('ci.learnMore'),
      url: 'https://ngdocs.harness.io/category/zgffarnh1m-ci-category'
    },
    startBtn: {
      description: getString('ci.ciTrialHomePage.startTrial.startBtn.description')
    }
  }

  return (
    <StartPlanTemplate
      title={getString('ci.continuous')}
      bgImageUrl={bgImageURL}
      startPlanProps={startTrialProps}
      module="ci"
    />
  )
}

export default CITrialHomePage
