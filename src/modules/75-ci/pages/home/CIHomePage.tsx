import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { pick } from 'lodash-es'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { TrialInProgressTemplate } from '@common/components/TrialHomePageTemplate/TrialInProgressTemplate'
import { ModuleName } from 'framework/types/ModuleName'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import type { Project } from 'services/cd-ng'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { Module } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import bgImageURL from './images/ci.svg'

const CIHomePage: React.FC = () => {
  const { getString } = useStrings()
  const { NG_LICENSES_ENABLED } = useFeatureFlags()

  const { accountId } = useParams<AccountPathProps>()

  const { currentUserInfo } = useAppStore()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()

  const { accounts } = currentUserInfo
  const createdFromNG = accounts?.find(account => account.uuid === accountId)?.createdFromNG
  const { data, error, refetch, loading } = useGetLicensesAndSummary({
    queryParams: { moduleType: ModuleName.CI as any },
    accountIdentifier: accountId
  })
  const { trial } = useQueryParams<{ trial?: boolean }>()

  const expiryTime = data?.data?.maxExpiryTime
  const updatedLicenseInfo = data?.data && {
    ...licenseInformation?.['CI'],
    ...pick(data?.data, ['licenseType', 'edition']),
    expiryTime
  }

  useEffect(() => {
    handleUpdateLicenseStore(
      { ...licenseInformation },
      updateLicenseStore,
      ModuleName.CI.toString() as Module,
      updatedLicenseInfo
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial])

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onWizardComplete: (projectData?: Project) => {
      closeProjectModal(),
        history.push({
          pathname: routes.toPipelineStudio({
            orgIdentifier: projectData?.orgIdentifier || '',
            projectIdentifier: projectData?.identifier || '',
            pipelineIdentifier: '-1',
            accountId,
            module: 'ci'
          }),
          search: '?modal=trial'
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

  const history = useHistory()

  const trialBannerProps = {
    expiryTime: data?.data?.maxExpiryTime,
    licenseType: data?.data?.licenseType,
    module: ModuleName.CI,
    refetch
  }

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
        module: 'ci'
      })
    )
  }

  if (showTrialPages && data && data.data && trial) {
    return (
      <TrialInProgressTemplate
        title={getString('ci.continuous')}
        bgImageUrl={bgImageURL}
        trialInProgressProps={trialInProgressProps}
        trialBannerProps={trialBannerProps}
      />
    )
  }

  // by default will return Home Page
  return (
    <HomePageTemplate
      title={getString('ci.continuous')}
      bgImageUrl={bgImageURL}
      subTitle={getString('ci.dashboard.subHeading')}
      documentText={getString('ci.learnMore')}
      documentURL="https://ngdocs.harness.io/category/zgffarnh1m-ci-category"
      trialBannerProps={trialBannerProps}
    />
  )
}

export default CIHomePage
