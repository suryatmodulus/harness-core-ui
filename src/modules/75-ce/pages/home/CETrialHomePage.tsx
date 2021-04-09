import React from 'react'
import { StartTrialTemplate } from '@common/components/TrialHomePageTemplate/StartTrialTemplate'
import { ModuleName, useStrings } from 'framework/exports'
import bgImageURL from './ce-homepage-bg.svg'

const CETrialHomePage: React.FC = () => {
  const { getString } = useStrings()

  const startTrialProps = {
    description: getString('ce.ceTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('ce.learnMore'),
      // TODO: need replace learn more url
      url: ''
    },
    startBtn: {
      description: getString('ce.ceTrialHomePage.startTrial.startBtn.description'),
      // TODO: need call licensing api and return value
      onClick: () => true
    },
    changePlan: {
      description: getString('common.changePlan'),
      // TODO: need replace change plan url
      url: ''
    }
  }

  return (
    <StartTrialTemplate
      title={getString('ce.continuous')}
      bgImageUrl={bgImageURL}
      startTrialProps={startTrialProps}
      module={ModuleName.CE}
    />
  )
}

export default CETrialHomePage
