import React from 'react'
import { StartTrialTemplate } from '@common/components/TrialHomePageTemplate/StartTrialTemplate'
import { ModuleName, useStrings } from 'framework/exports'
import bgImageURL from './images/homeIllustration.svg'

const CITrialHomePage: React.FC = () => {
  const { getString } = useStrings()

  const startTrialProps = {
    description: getString('ci.ciTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('ci.learnMore'),
      // TODO: need replace learn more url
      url: ''
    },
    startBtn: {
      description: getString('ci.ciTrialHomePage.startTrial.startBtn.description')
    },
    changePlan: {
      description: getString('common.changePlan'),
      // TODO: need replace change plan url
      url: ''
    }
  }

  return (
    <StartTrialTemplate
      title={getString('ci.continuous')}
      bgImageUrl={bgImageURL}
      startTrialProps={startTrialProps}
      module={ModuleName.CI}
    />
  )
}

export default CITrialHomePage
