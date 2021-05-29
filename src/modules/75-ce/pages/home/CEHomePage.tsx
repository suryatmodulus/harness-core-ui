import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import { useGetModuleLicenseInfo } from 'services/portal'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import { TrialInProgressTemplate } from '@common/components/TrialHomePageTemplate/TrialInProgressTemplate'
import { useQueryParams } from '@common/hooks'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { Project } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import bgImageURL from './ce-homepage-bg.svg'

const CEHomePage: React.FC = () => {
  const { getString } = useStrings()

  const { accountId } = useParams<{
    accountId: string
  }>()

  const moduleLicenseQueryParams = {
    queryParams: {
      accountIdentifier: accountId,
      moduleType: ModuleName.CE
    }
  }

  const { data, error, refetch, loading } = useGetModuleLicenseInfo(moduleLicenseQueryParams)

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onWizardComplete: (projectData?: Project) => {
      closeProjectModal(),
        history.push({
          pathname: routes.toCECORules({
            orgIdentifier: projectData?.orgIdentifier || '',
            projectIdentifier: projectData?.identifier || '',
            accountId
          })
        })
    },
    module: ModuleName.CE
  })

  const trialInProgressProps = {
    description: getString('common.trialInProgressDescription'),
    startBtn: {
      description: getString('createProject'),
      onClick: openProjectModal
    }
  }

  const { trial } = useQueryParams<{ trial?: boolean }>()

  const history = useHistory()

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    return <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
  }

  const createdFromNG = false

  if (createdFromNG && data?.status === 'SUCCESS' && !data.data) {
    history.push(
      routes.toModuleTrialHome({
        accountId,
        module: 'ce'
      })
    )
  }

  if (createdFromNG && data && data.data && trial) {
    return (
      <TrialInProgressTemplate
        title={getString('ce.continuous')}
        bgImageUrl={bgImageURL}
        trialInProgressProps={trialInProgressProps}
        module={ModuleName.CE}
      />
    )
  }

  return (
    <HomePageTemplate
      title={getString('ce.continuous')}
      bgImageUrl={bgImageURL}
      subTitle={getString('ce.homepage.slogan')}
      documentText={getString('ce.learnMore')}
    />
  )
}

export default CEHomePage
