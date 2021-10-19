import React from 'react'
import StartPlanTemplate from '@rbac/components/HomePageTemplate/StartPlanTemplate'
import { useStrings } from 'framework/strings'
import bgImageURL from './ff.svg'

const CFTrialHomePage: React.FC = () => {
  const { getString } = useStrings()

  const startTrialProps = {
    description: getString('cf.cfTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('cf.learnMore'),
      url: 'https://ngdocs.harness.io/article/0a2u2ppp8s-getting-started-with-continuous-features'
    },
    startBtn: {
      description: getString('cf.cfTrialHomePage.startTrial.startBtn.description')
    }
  }

  return (
    <StartPlanTemplate
      title={getString('cf.continuous')}
      bgImageUrl={bgImageURL}
      startPlanProps={startTrialProps}
      module="cf"
    />
  )
}

export default CFTrialHomePage
