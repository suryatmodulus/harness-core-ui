import React from 'react'
import { StartTrialTemplate } from '@common/components/TrialHomePageTemplate/StartTrialTemplate'
import { useStrings } from 'framework/strings'
import bgImageURL from './cf-homepage-bg.svg'

const CFTrialHomePage: React.FC = () => {
  const { getString } = useStrings()

  const startTrialProps = {
    description: getString('cf.cfTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('cf.learnMore'),
      // TODO: need replace learn more url
      url: ''
    },
    startBtn: {
      description: getString('cf.cfTrialHomePage.startTrial.startBtn.description'),
      // TODO: need call licensing api and return value
      onClick: () => true
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
