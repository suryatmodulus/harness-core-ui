import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { pick } from 'lodash-es'
import { PageError, PageSpinner } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { HomePageTemplate } from '@projects-orgs/pages/HomePageTemplate/HomePageTemplate'
import { TrialInProgressTemplate } from '@rbac/components/TrialHomePageTemplate/TrialInProgressTemplate'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import type { Project } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { Editions, ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import bgImageURL from './ff.svg'

const CFHomePage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { currentUserInfo, selectedProject } = useAppStore()
  const { NG_LICENSES_ENABLED } = useFeatureFlags()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const moduleType = ModuleName.CF
  const module = moduleType.toLowerCase() as Module

  const { accounts } = currentUserInfo
  const createdFromNG = accounts?.find(account => account.uuid === accountId)?.createdFromNG

  const { data, error, refetch, loading } = useGetLicensesAndSummary({
    queryParams: { moduleType },
    accountIdentifier: accountId
  })

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onWizardComplete: (projectData?: Project) => {
      closeProjectModal()
      history.push({
        pathname: routes.toCFOnboarding({
          orgIdentifier: projectData?.orgIdentifier || '',
          projectIdentifier: projectData?.identifier || '',
          accountId
        })
      })
    }
  })

  const trialInProgressProps = {
    description: getString('common.trialInProgressDescription'),
    startBtn: {
      description: getString('createProject'),
      onClick: openProjectModal
    }
  }

  const trialBannerProps = {
    expiryTime: data?.data?.maxExpiryTime,
    licenseType: data?.data?.licenseType,
    module: moduleType,
    edition: data?.data?.edition as Editions,
    refetch
  }

  const { experience } = useQueryParams<{ experience?: string }>()

  const history = useHistory()

  const expiryTime = data?.data?.maxExpiryTime
  const updatedLicenseInfo = data?.data && {
    ...licenseInformation?.[moduleType],
    ...pick(data?.data, ['licenseType', 'edition']),
    expiryTime
  }

  useEffect(() => {
    handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, updatedLicenseInfo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experience])

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    return <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
  }

  const showTrialPages = createdFromNG || NG_LICENSES_ENABLED

  if (showTrialPages && data?.status === 'SUCCESS' && !data.data) {
    history.push(
      routes.toModuleTrialHome({
        accountId,
        module
      })
    )
  }

  if (showTrialPages && experience === ModuleLicenseType.TRIAL) {
    return (
      <TrialInProgressTemplate
        title={getString('cf.continuous')}
        bgImageUrl={bgImageURL}
        trialInProgressProps={trialInProgressProps}
        trialBannerProps={trialBannerProps}
      />
    )
  }

  if (selectedProject && !experience) {
    history.replace(
      routes.toCFFeatureFlags({
        projectIdentifier: selectedProject.identifier,
        orgIdentifier: selectedProject.orgIdentifier || '',
        accountId
      })
    )
  }

  const projectCreateSuccessHandler = (project?: Project): void => {
    if (experience) {
      history.push({
        pathname: routes.toCFOnboarding({
          orgIdentifier: project?.orgIdentifier || '',
          projectIdentifier: project?.identifier || '',
          accountId
        })
      })
      return
    }
    if (project) {
      history.push(
        routes.toCFFeatureFlags({
          projectIdentifier: project.identifier,
          orgIdentifier: project.orgIdentifier || '',
          accountId
        })
      )
    }
  }

  // by default will return Home Page
  return (
    <HomePageTemplate
      title={getString('cf.continuous')}
      bgImageUrl={bgImageURL}
      projectCreateSuccessHandler={projectCreateSuccessHandler}
      subTitle={getString('cf.homepage.slogan')}
      documentText={getString('cf.homepage.learnMore')}
      documentURL="https://ngdocs.harness.io/article/0a2u2ppp8s-getting-started-with-continuous-features"
      trialBannerProps={trialBannerProps}
      module={module}
    />
  )
}

export default CFHomePage
