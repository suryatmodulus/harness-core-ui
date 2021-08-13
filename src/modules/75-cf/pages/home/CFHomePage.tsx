import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { pick } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import { TrialInProgressTemplate } from '@common/components/TrialHomePageTemplate/TrialInProgressTemplate'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import type { Project } from 'services/cd-ng'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import routes from '@common/RouteDefinitions'
import type { Module, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import bgImageURL from './ff.svg'

const CFHomePage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { currentUserInfo, selectedProject } = useAppStore()
  const { NG_LICENSES_ENABLED } = useFeatureFlags()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()

  const { accounts } = currentUserInfo
  const createdFromNG = accounts?.find(account => account.uuid === accountId)?.createdFromNG

  const { data, error, refetch, loading } = useGetLicensesAndSummary({
    queryParams: { moduleType: ModuleName.CF as any },
    accountIdentifier: accountId
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
    module: ModuleName.CF,
    refetch
  }

  const { trial } = useQueryParams<{ trial?: boolean }>()

  const history = useHistory()

  const expiryTime = data?.data?.maxExpiryTime
  const updatedLicenseInfo = data?.data && {
    ...licenseInformation?.['CF'],
    ...pick(data?.data, ['licenseType', 'edition']),
    expiryTime
  }

  useEffect(() => {
    handleUpdateLicenseStore(
      { ...licenseInformation },
      updateLicenseStore,
      ModuleName.CF.toString() as Module,
      updatedLicenseInfo
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial])

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
        module: 'cf'
      })
    )
  }

  if (showTrialPages && data && data.data && trial) {
    return (
      <TrialInProgressTemplate
        title={getString('cf.continuous')}
        bgImageUrl={bgImageURL}
        trialInProgressProps={trialInProgressProps}
        trialBannerProps={trialBannerProps}
      />
    )
  }

  if (selectedProject) {
    history.replace(
      routes.toCFFeatureFlags({
        projectIdentifier: selectedProject.identifier,
        orgIdentifier: selectedProject.orgIdentifier || '',
        accountId
      })
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
