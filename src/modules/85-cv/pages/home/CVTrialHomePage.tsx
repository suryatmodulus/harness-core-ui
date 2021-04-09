import React from 'react'
import { StartTrialTemplate } from '@common/components/TrialHomePageTemplate/StartTrialTemplate'
import { ModuleName, useStrings } from 'framework/exports'
import bgImageURL from './images/homeIllustration.svg'

const CVTrialHomePage: React.FC = () => {
  const { getString } = useStrings()

  const startTrialProps = {
    description: getString('cv.cvTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('cv.learnMore'),
      // TODO: need replace learn more url
      url: ''
    },
    startBtn: {
      description: getString('cv.cvTrialHomePage.startTrial.startBtn.description'),
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
      title={getString('cv.continuous')}
      bgImageUrl={bgImageURL}
      startTrialProps={startTrialProps}
      module={ModuleName.CV}
    />
  )
}

export default CVTrialHomePage
