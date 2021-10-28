import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { pick } from 'lodash-es'
import { PageError, PageSpinner } from '@wings-software/uicore'
import { TrialInProgressTemplate } from '@rbac/components/TrialHomePageTemplate/TrialInProgressTemplate'
import { ModuleName } from 'framework/types/ModuleName'
import { HomePageTemplate } from '@projects-orgs/pages/HomePageTemplate/HomePageTemplate'
import { useStrings } from 'framework/strings'
import { useGetLicensesAndSummary, useGetProjectList } from 'services/cd-ng'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { Project } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useGetPipelineList, PagePMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { TrialType, useCDTrialModal, UseCDTrialModalProps } from '@cd/modals/CDTrial/useCDTrialModal'
import routes from '@common/RouteDefinitions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { handleUpdateLicenseStore, useLicenseStore, isCDCommunity } from 'framework/LicenseStore/LicenseStoreContext'
import { useToaster } from '@common/components'
import type { Editions } from '@common/constants/SubscriptionTypes'
import CDTrialHomePage from './CDTrialHomePage'
import bgImageURL from './images/cd.svg'

export const CDHomePage: React.FC = () => {
  const { getString } = useStrings()
  const { NG_LICENSES_ENABLED } = useFeatureFlags()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const { showError } = useToaster()

  const { accountId } = useParams<AccountPathProps>()

  const {
    data,
    error: licenseErr,
    refetch: refetchLicense,
    loading: gettingLicense
  } = useGetLicensesAndSummary({
    queryParams: { moduleType: ModuleName.CD as any },
    accountIdentifier: accountId
  })

  const expiryTime = data?.data?.maxExpiryTime
  const updatedLicenseInfo = data?.data && {
    ...licenseInformation?.['CD'],
    ...pick(data?.data, ['licenseType', 'edition']),
    expiryTime
  }

  useEffect(() => {
    handleUpdateLicenseStore(
      { ...licenseInformation },
      updateLicenseStore,
      ModuleName.CD.toString() as Module,
      updatedLicenseInfo
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const trialBannerProps = {
    expiryTime: data?.data?.maxExpiryTime,
    licenseType: data?.data?.licenseType,
    module: ModuleName.CD,
    edition: data?.data?.edition as Editions,
    refetch: refetchLicense
  }

  const pushToPipelineStudio = (pipelinId: string, projectData?: Project, search?: string): void => {
    const pathname = routes.toPipelineStudio({
      orgIdentifier: projectData?.orgIdentifier || '',
      projectIdentifier: projectData?.identifier || '',
      pipelineIdentifier: pipelinId,
      accountId,
      module: 'cd'
    })
    search
      ? history.push({
          pathname,
          search
        })
      : history.push(pathname)
  }

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onWizardComplete: (projectData?: Project) => {
      closeProjectModal(), pushToPipelineStudio('-1', projectData, '?modal=trial')
    }
  })

  const trialInProgressProps = {
    description: getString('common.trialInProgressDescription'),
    startBtn: {
      description: getString('createProject'),
      onClick: openProjectModal
    }
  }

  const { trial, modal, community } = useQueryParams<{ trial?: boolean; modal?: boolean; community?: boolean }>()
  const { selectedProject, currentUserInfo } = useAppStore()
  const { accounts, defaultAccountId } = currentUserInfo
  const createdFromNG = accounts?.find(account => account.uuid === defaultAccountId)?.createdFromNG
  const history = useHistory()

  const [pipelineData, setData] = React.useState<PagePMSPipelineSummaryResponse | undefined>(undefined)

  const {
    mutate: reloadPipelines,
    cancel,
    loading: gettingPipelines
  } = useGetPipelineList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier: selectedProject?.identifier || '',
      orgIdentifier: selectedProject?.orgIdentifier || '',
      module: 'cd',
      size: 1
    }
  })

  const fetchPipelines = React.useCallback(
    async () => {
      try {
        cancel()
        setData(await (await reloadPipelines({ filterType: 'PipelineSetup' })).data)
      } catch (err) {
        showError(err.data?.message || getString('somethingWentWrong'))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cancel]
  )

  React.useEffect(() => {
    if (selectedProject?.identifier && selectedProject?.orgIdentifier) {
      fetchPipelines()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject?.identifier, selectedProject?.orgIdentifier])

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
  const pipelinesExist = !!pipelineData?.content?.length

  const getCDTrialModalProps = (): UseCDTrialModalProps => {
    const props = selectedProject
      ? {
          actionProps: {
            onSuccess: (pipelineId: string) => pushToPipelineStudio(pipelineId, selectedProject)
          },
          trialType: TrialType.CREATE_OR_SELECT_PIPELINE
        }
      : {
          actionProps: {
            onCreateProject: openProjectModal
          },
          trialType: TrialType.CREATE_OR_SELECT_PROJECT
        }
    return props
  }

  const { openCDTrialModal } = useCDTrialModal({
    ...getCDTrialModalProps()
  })

  useEffect(
    () => {
      refetchLicense()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trial]
  )

  useEffect(
    () => {
      if (modal && !gettingProjects && !gettingPipelines) {
        // selectedProject exists and no pipelines, forward to create pipeline
        if (selectedProject && !pipelinesExist) {
          pushToPipelineStudio('-1', selectedProject)
        } else if (!selectedProject && !projectsExist) {
          // selectedProject doesnot exist and projects donot exist, open project modal
          openProjectModal()
        } else {
          // otherwise, just open cd trial modal
          openCDTrialModal()
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modal, selectedProject, gettingProjects, gettingPipelines]
  )

  if (gettingLicense || gettingProjects || gettingPipelines) {
    return <PageSpinner />
  }

  if (licenseErr) {
    const message = (licenseErr?.data as Error)?.message || licenseErr?.message
    return <PageError message={message} onClick={() => refetchLicense()} />
  }

  if (projectsErr) {
    const message = (projectsErr?.data as Error)?.message || projectsErr?.message
    return <PageError message={message} onClick={() => refetchProject()} />
  }

  const showTrialPages = createdFromNG || NG_LICENSES_ENABLED

  if (showTrialPages && data?.status === 'SUCCESS' && !data.data) {
    return <CDTrialHomePage />
  }

  if (showTrialPages && data && data.data && trial) {
    return (
      <TrialInProgressTemplate
        title={getString('cd.continuous')}
        bgImageUrl={bgImageURL}
        trialInProgressProps={trialInProgressProps}
        trialBannerProps={trialBannerProps}
      />
    )
  }

  const projectCreateSuccessHandler = (project?: Project): void => {
    if (isCDCommunity(licenseInformation) && community) {
      pushToPipelineStudio('-1', project, '?modal=trial')
      return
    }

    if (project) {
      history.push(
        routes.toProjectOverview({
          projectIdentifier: project.identifier,
          orgIdentifier: project.orgIdentifier || /* istanbul ignore next */ '',
          accountId,
          module: 'cd'
        })
      )
    }
  }

  return (
    <HomePageTemplate
      title={getString('cd.continuous')}
      bgImageUrl={bgImageURL}
      projectCreateSuccessHandler={projectCreateSuccessHandler}
      subTitle={getString('cd.dashboard.subHeading')}
      documentText={getString('cd.learnMore')}
      trialBannerProps={trialBannerProps}
    />
  )
}

export default CDHomePage
