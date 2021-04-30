import React from 'react'
import { useStrings } from 'framework/strings'
import { StartTrialTemplate } from '@common/components/TrialHomePageTemplate/StartTrialTemplate'
import bgImageURL from './images/homeIllustration.svg'

const CITrialHomePage: React.FC = () => {
  const { getString } = useStrings()

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
    <StartTrialTemplate
      title={getString('ci.continuous')}
      bgImageUrl={bgImageURL}
      startTrialProps={startTrialProps}
      module="ci"
    />
  )
}

export default CITrialHomePage
