import React from 'react'
import { StartTrialTemplate } from '@common/components/TrialHomePageTemplate/StartTrialTemplate'
import { ModuleName, useStrings } from 'framework/exports'
import bgImageURL from './images/homeIllustration.svg'

const CDTrialHomePage: React.FC = () => {
  const { getString } = useStrings()

  const startTrialProps = {
    description: getString('cd.cdTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('cd.learnMore'),
      // TODO: need replace learn more url
      url: ''
    },
    startBtn: {
      description: getString('cd.cdTrialHomePage.startTrial.startBtn.description'),
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
      title={getString('cd.continuous')}
      bgImageUrl={bgImageURL}
      startTrialProps={startTrialProps}
      module={ModuleName.CD}
    />
  )
}

export default CDTrialHomePage
