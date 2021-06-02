import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import useCETrialModal from '@ce/modals/CETrialModal/useCETrialModal'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import { useGetModuleLicenseInfo } from 'services/portal'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import { TrialInProgressTemplate } from '@common/components/TrialHomePageTemplate/TrialInProgressTemplate'
import { useQueryParams } from '@common/hooks'
import { useGetProjectList } from 'services/cd-ng'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { Project } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import CETrialHomePage from './CETrialHomePage'
import bgImageURL from './ce-homepage-bg.svg'

const CEHomePage: React.FC = () => {
  const { getString } = useStrings()
  const { currentUserInfo, selectedProject, updateAppStore } = useAppStore()

  const { accountId } = useParams<{
    accountId: string
  }>()

  const { trial } = useQueryParams<{ trial?: boolean }>()

  const moduleLicenseQueryParams = {
    queryParams: {
      accountIdentifier: accountId,
      moduleType: ModuleName.CE
    }
  }

  const { accounts, defaultAccountId } = currentUserInfo
  const createdFromNG = accounts?.find(account => account.uuid === defaultAccountId)?.createdFromNG

  const { data: projectListData, loading: getProjectListLoading, error: getProjectListError } = useGetProjectList({
    queryParams: {
      accountIdentifier: accountId
    },
    debounce: 300
  })

  const { data, error, refetch, loading } = useGetModuleLicenseInfo(moduleLicenseQueryParams)

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial])

  function handleSelectProjectFromModal(provider: string, project?: Project): void {
    history.push({
      pathname: routes.toCECOCreateGateway({
        orgIdentifier: project?.orgIdentifier || selectedProject?.orgIdentifier || '',
        projectIdentifier: project?.orgIdentifier || selectedProject?.identifier || '',
        accountId
      }),
      search: `?provider=${provider}`
    })
  }

  function handleRouteToCECO(): void {
    history.push({
      pathname: routes.toCECORules({
        orgIdentifier: selectedProject?.orgIdentifier || '',
        projectIdentifier: selectedProject?.identifier || '',
        accountId
      })
    })
  }

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onWizardComplete: (project?: Project) => {
      updateAppStore({ selectedProject: project })
      closeProjectModal()
      showModal()
    },
    module: ModuleName.CE
  })

  function handleOpenProjectModal(): void {
    hideModal()
    openProjectModal()
  }

  const { showModal, hideModal } = useCETrialModal({
    isProjectSelected: Boolean(selectedProject),
    openProjectModal: handleOpenProjectModal,
    routeToCE: handleSelectProjectFromModal,
    onClose: selectedProject ? handleRouteToCECO : undefined
  })

  const projectsExist = projectListData?.data?.content?.length !== 0

  useEffect(() => {
    if (trial) {
      if (projectsExist) {
        showModal()
      } else {
        openProjectModal()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsExist, trial])

  const trialInProgressProps = {
    description: getString('common.trialInProgressDescription'),
    startBtn: {
      description: getString('createProject'),
      onClick: openProjectModal
    }
  }

  const history = useHistory()

  const trialBannerProps = {
    expiryTime: data?.data?.expiryTime,
    licenseType: data?.data?.licenseType,
    module: ModuleName.CE
  }

  if (loading || getProjectListLoading) {
    return <PageSpinner />
  }

  if (error || getProjectListError) {
    const message =
      (error?.data as Error)?.message ||
      error?.message ||
      (getProjectListError?.data as Error)?.message ||
      getProjectListError?.message
    return <PageError message={message} onClick={() => refetch()} />
  }

  if (createdFromNG && data?.status === 'SUCCESS' && !data.data) {
    return <CETrialHomePage />
  }

  if (createdFromNG && data && data.data && trial) {
    return (
      <TrialInProgressTemplate
        title={getString('ce.continuous')}
        bgImageUrl={bgImageURL}
        trialInProgressProps={trialInProgressProps}
        trialBannerProps={trialBannerProps}
      />
    )
  }

  return (
    <HomePageTemplate
      title={getString('ce.continuous')}
      bgImageUrl={bgImageURL}
      subTitle={getString('ce.homepage.slogan')}
      documentText={getString('ce.learnMore')}
      trialBannerProps={trialBannerProps}
    />
  )
}

export default CEHomePage
