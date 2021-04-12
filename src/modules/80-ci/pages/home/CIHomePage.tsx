import React from 'react'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import { useStrings } from 'framework/exports'
import bgImageURL from './images/homeIllustration.svg'

const CIHomePage: React.FC = () => {
  const { getString } = useStrings()

  return (
    <HomePageTemplate
      title={getString('ci.continuous')}
      bgImageUrl={bgImageURL}
      subTitle={getString('ci.dashboard.subHeading')}
      documentText={getString('ci.learnMore')}
    />
  )
}

export default CIHomePage
