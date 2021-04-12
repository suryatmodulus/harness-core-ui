import React from 'react'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import { useStrings } from 'framework/exports'
import bgImageURL from './images/homeIllustration.svg'

const CVHomePage: React.FC = () => {
  const { getString } = useStrings()

  return (
    <HomePageTemplate
      title={getString('cv.continuous')}
      bgImageUrl={bgImageURL}
      subTitle={getString('cv.dashboard.subHeading')}
      documentText={getString('cv.dashboard.learnMore')}
    />
  )
}

export default CVHomePage
