import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { pick } from 'lodash-es'
import { PageError, PageSpinner } from '@wings-software/uicore'
import { HomePageTemplate } from '@projects-orgs/pages/HomePageTemplate/HomePageTemplate'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { TrialInProgressTemplate } from '@rbac/components/TrialHomePageTemplate/TrialInProgressTemplate'
import { ModuleName } from 'framework/types/ModuleName'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import type { Project } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { useQueryParams, useGetPipelines } from '@common/hooks'
import { useGetLicensesAndSummary, useGetProjectList } from 'services/cd-ng'
import { useCITrialModal } from '@ci/modals/CITrial/useCITrialModal'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { Editions, ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import { getTrialModalProps, openModal } from '@templates-library/components/TrialModalTemplate/trialModalUtils'
import bgImageURL from './images/ci.svg'

const CIHomePage: React.FC = () => {
  const { getString } = useStrings()
  const { NG_LICENSES_ENABLED } = useFeatureFlags()

  const { accountId } = useParams<AccountPathProps>()

  const { currentUserInfo, selectedProject } = useAppStore()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const moduleType = ModuleName.CI
  const module = moduleType.toLowerCase() as Module

  const { accounts } = currentUserInfo
  const createdFromNG = accounts?.find(account => account.uuid === accountId)?.createdFromNG
  const {
    data: licenseData,
    error: licenseErr,
    refetch: refetchLicense,
    loading: gettingLicense
  } = useGetLicensesAndSummary({
    queryParams: { moduleType },
    accountIdentifier: accountId
  })
  const { experience, modal } = useQueryParams<{ experience?: ModuleLicenseType; modal?: ModuleLicenseType }>()

  const expiryTime = licenseData?.data?.maxExpiryTime
  const updatedLicenseInfo = licenseData?.data && {
    ...licenseInformation?.[moduleType],
    ...pick(licenseData?.data, ['licenseType', 'edition']),
    expiryTime
  }

  const {
    data: pipelineData,
    loading: gettingPipelines,
    refetch: refetchPipeline,
    error: pipelineError
  } = useGetPipelines({
    accountIdentifier: accountId,
    projectIdentifier: selectedProject?.identifier || '',
    orgIdentifier: selectedProject?.orgIdentifier || '',
    module,
    lazy: true
  })

  useEffect(() => {
    if (selectedProject) {
      refetchPipeline()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject])

  // get project lists via accountId
  const {
    data: projectListData,
    loading: gettingProjects,
    error: projectsErr,
    refetch: refetchProject
  } = useGetProjectList({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const projectsExist = !!projectListData?.data?.content?.length
  const pipelinesExist = !!pipelineData?.data?.content?.length

  useEffect(() => {
    handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, updatedLicenseInfo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licenseData])

  useEffect(() => {
    refetchLicense()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experience])

  const pushToPipelineStudio = (pipelinId: string, projectData?: Project, search?: string): void => {
    const pathname = routes.toPipelineStudio({
      orgIdentifier: projectData?.orgIdentifier || '',
      projectIdentifier: projectData?.identifier || '',
      pipelineIdentifier: pipelinId,
      accountId,
      module
    })
    history.push({
      pathname,
      search
    })
  }

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onWizardComplete: (projectData?: Project) => {
      closeProjectModal()
      pushToPipelineStudio('-1', projectData, `?modal=${experience}`)
    }
  })

  const modalProps = getTrialModalProps({ selectedProject, openProjectModal, pushToPipelineStudio })
  const { openCITrialModal } = useCITrialModal({ ...modalProps })

  const trialInProgressProps = {
    description: getString('common.trialInProgressDescription'),
    startBtn: {
      description: getString('createProject'),
      onClick: openProjectModal
    }
  }

  const history = useHistory()

  const trialBannerProps = {
    expiryTime: licenseData?.data?.maxExpiryTime,
    licenseType: licenseData?.data?.licenseType,
    module: moduleType,
    edition: licenseData?.data?.edition as Editions,
    refetch: refetchLicense
  }

  useEffect(
    () => {
      openModal({
        modal,
        gettingProjects,
        gettingPipelines,
        selectedProject,
        pipelinesExist,
        projectsExist,
        openProjectModal,
        openTrialModal: openCITrialModal,
        pushToPipelineStudio
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modal, selectedProject, gettingProjects, gettingPipelines, pipelinesExist, projectsExist]
  )

  if (gettingLicense || gettingProjects || gettingPipelines) {
    return <PageSpinner />
  }

  if (licenseErr) {
    return <PageError message={licenseErr.message} onClick={() => refetchLicense()} />
  }

  if (projectsErr) {
    return <PageError message={projectsErr.message} onClick={() => refetchProject()} />
  }

  if (pipelineError) {
    return <PageError message={pipelineError.message} onClick={() => refetchPipeline()} />
  }

  const showTrialPages = createdFromNG || NG_LICENSES_ENABLED

  if (showTrialPages && licenseData?.status === 'SUCCESS' && !licenseData.data) {
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
        title={getString('ci.continuous')}
        bgImageUrl={bgImageURL}
        trialInProgressProps={trialInProgressProps}
        trialBannerProps={trialBannerProps}
      />
    )
  }

  const projectCreateSuccessHandler = (project?: Project): void => {
    if (experience) {
      pushToPipelineStudio('-1', project, `?modal=${experience}`)
      return
    }
    if (project) {
      history.push(
        routes.toProjectOverview({
          projectIdentifier: project.identifier,
          orgIdentifier: project.orgIdentifier || '',
          accountId,
          module
        })
      )
    }
  }

  // by default will return Home Page
  return (
    <HomePageTemplate
      title={getString('ci.continuous')}
      bgImageUrl={bgImageURL}
      projectCreateSuccessHandler={projectCreateSuccessHandler}
      subTitle={getString('ci.dashboard.subHeading')}
      documentText={getString('ci.learnMore')}
      documentURL="https://ngdocs.harness.io/category/zgffarnh1m-ci-category"
      trialBannerProps={trialBannerProps}
    />
  )
}

export default CIHomePage
