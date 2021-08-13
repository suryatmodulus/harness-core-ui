import React from 'react'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import bgImageURL from './images/homeIllustration.svg'

const CVHomePage: React.FC = () => {
  const { getString } = useStrings()

  const trialBannerProps = {
    module: ModuleName.CV
  }

  return (
    <HomePageTemplate
      title={getString('common.changeIntelligence')}
      bgImageUrl={bgImageURL}
      subTitle={getString('cv.dashboard.subHeading')}
      documentText={getString('cv.learnMore')}
      trialBannerProps={trialBannerProps}
    />
  )
}

export default CVHomePage
