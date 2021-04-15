import React from 'react'
import { useStrings } from 'framework/exports'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import bgImageURL from './ce-homepage-bg.svg'

const CEHomePage: React.FC = () => {
  const { getString } = useStrings()

  return (
    <HomePageTemplate
      title={getString('ce.continuous')}
      bgImageUrl={bgImageURL}
      subTitle={getString('ce.homepage.slogan')}
      documentText={getString('cf.homepage.learnMore')}
    />
  )
}

export default CEHomePage
