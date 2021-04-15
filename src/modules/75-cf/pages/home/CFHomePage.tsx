import React from 'react'
import { useStrings } from 'framework/exports'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import bgImageURL from './cf-homepage-bg.svg'

const CFHomePage: React.FC = () => {
  const { getString } = useStrings()

  return (
    <HomePageTemplate
      title={getString('cf.continuous')}
      bgImageUrl={bgImageURL}
      subTitle={getString('cf.homepage.slogan')}
      documentText={getString('cf.homepage.learnMore')}
    />
  )
}

export default CFHomePage
