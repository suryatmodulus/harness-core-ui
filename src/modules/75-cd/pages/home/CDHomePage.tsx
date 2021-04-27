import React from 'react'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import { useStrings } from 'framework/strings'
import bgImageURL from './images/homeIllustration.svg'

export const CDHomePage: React.FC = () => {
  const { getString } = useStrings()

  return (
    <HomePageTemplate
      title={getString('cd.continuous')}
      bgImageUrl={bgImageURL}
      subTitle={getString('cd.dashboard.subHeading')}
      documentText={getString('cd.learnMore')}
    />
  )
}

export default CDHomePage
