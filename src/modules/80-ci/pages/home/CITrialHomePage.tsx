import React from 'react'
import { TrialHomePageTemplate } from '@common/components/TrialHomePageTemplate/TrialHomePageTemplate'
import { useStrings } from 'framework/exports'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import bgImageURL from './images/homeIllustration.svg'

const CITrialHomePage: React.FC = () => {
  const { getString } = useStrings()
  const projectCreateSuccessHandler = (): void => {
    // TODO: need add event handler
  }
  const { openProjectModal } = useProjectModal({
    onSuccess: projectCreateSuccessHandler
  })
  const trialInProgressProps = {
    description: getString('ci.ciTrialHomePage.trialInProgress.description'),
    startBtn: {
      description: getString('createProject'),
      onClick: openProjectModal
    }
  }

  const startTrialProps = {
    description: getString('ci.ciTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('ci.learnMore'),
      // TODO: need replace learn more url
      url: ''
    },
    startBtn: {
      description: getString('ci.ciTrialHomePage.startTrial.startBtn.description'),
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
    <TrialHomePageTemplate
      title={getString('ci.continuous')}
      bgImageUrl={bgImageURL}
      trialInProgressProps={trialInProgressProps}
      startTrialProps={startTrialProps}
    />
  )
}

export default CITrialHomePage
