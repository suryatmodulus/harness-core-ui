import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import { TrialInProgressTemplate } from '@common/components/TrialHomePageTemplate/TrialInProgressTemplate'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import type { Project } from 'services/cd-ng'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import { useGetModuleLicenseByAccountAndModuleType } from 'services/cd-ng'
import bgImageURL from './cf-homepage-bg.svg'

const CFHomePage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<{
    accountId: string
  }>()
  const getModuleLicenseQueryParams = {
    accountIdentifier: accountId,
    moduleType: ModuleName.CF as any
  }
  const { currentUserInfo } = useAppStore()

  const { accounts, defaultAccountId } = currentUserInfo
  const createdFromNG = accounts?.find(account => account.uuid === defaultAccountId)?.createdFromNG

  const { data, error, refetch, loading } = useGetModuleLicenseByAccountAndModuleType({
    queryParams: getModuleLicenseQueryParams
  })

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onWizardComplete: (projectData?: Project) => {
      closeProjectModal(),
        history.push({
          pathname: routes.toCFOnboarding({
            orgIdentifier: projectData?.orgIdentifier || '',
            projectIdentifier: projectData?.identifier || '',
            accountId
          })
        })
    },
    module: ModuleName.CF
  })

  const trialInProgressProps = {
    description: getString('common.trialInProgressDescription'),
    startBtn: {
      description: getString('createProject'),
      onClick: openProjectModal
    }
  }

  const trialBannerProps = {
    expiryTime: data?.data?.expiryTime,
    licenseType: data?.data?.licenseType,
    module: ModuleName.CF
  }

  const { trial } = useQueryParams<{ trial?: boolean }>()

  const history = useHistory()

  useEffect(() => {
    refetch()
  }, [trial])

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    return <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
  }

  if (createdFromNG && data?.status === 'SUCCESS' && !data.data) {
    history.push(
      routes.toModuleTrialHome({
        accountId,
        module: 'cf'
      })
    )
  }

  if (createdFromNG && data && data.data && trial) {
    return (
      <TrialInProgressTemplate
        title={getString('cf.continuous')}
        bgImageUrl={bgImageURL}
        trialInProgressProps={trialInProgressProps}
        trialBannerProps={trialBannerProps}
      />
    )
  }

  // by default will return Home Page
  return (
    <HomePageTemplate
      title={getString('cf.continuous')}
      bgImageUrl={bgImageURL}
      subTitle={getString('cf.homepage.slogan')}
      documentText={getString('cf.homepage.learnMore')}
      documentURL="https://ngdocs.harness.io/article/0a2u2ppp8s-getting-started-with-continuous-features"
      trialBannerProps={trialBannerProps}
    />
  )
}

export default CFHomePage
