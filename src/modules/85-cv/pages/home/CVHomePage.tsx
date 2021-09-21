import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { HomePageTemplate } from '@projects-orgs/pages/HomePageTemplate/HomePageTemplate'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import type { Project } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import bgImageURL from './images/homeIllustration.svg'

const CVHomePage: React.FC = () => {
  const { getString } = useStrings()

  const trialBannerProps = {
    module: ModuleName.CV
  }
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()

  const projectCreateSuccessHandler = (project?: Project): void => {
    if (project) {
      history.push(
        routes.toCVProjectOverview({
          projectIdentifier: project.identifier,
          orgIdentifier: project.orgIdentifier || '',
          accountId
        })
      )
    }
  }

  return (
    <HomePageTemplate
      title={getString('common.changeIntelligence')}
      bgImageUrl={bgImageURL}
      projectCreateSuccessHandler={projectCreateSuccessHandler}
      subTitle={getString('cv.dashboard.subHeading')}
      documentText={getString('cv.learnMore')}
      trialBannerProps={trialBannerProps}
    />
  )
}

export default CVHomePage
