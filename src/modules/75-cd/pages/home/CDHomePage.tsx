import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { ModuleName } from 'framework/types/ModuleName'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import { useStrings } from 'framework/strings'
import { useGetLicensesAndSummary, useGetProjectList } from 'services/cd-ng'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { TrialInProgressTemplate } from '@common/components/TrialHomePageTemplate/TrialInProgressTemplate'
import { useQueryParams } from '@common/hooks'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { Project } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useGetPipelineList, PagePMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { TrialType, useCDTrialModal, UseCDTrialModalProps } from '@cd/modals/CDTrial/useCDTrialModal'
import routes from '@common/RouteDefinitions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import CDTrialHomePage from './CDTrialHomePage'
import bgImageURL from './images/cd.svg'

export const CDHomePage: React.FC = () => {
  const { getString } = useStrings()
  const { NG_LICENSES_ENABLED } = useFeatureFlags()

  const { accountId } = useParams<AccountPathProps>()

  const { data, error, refetch, loading } = useGetLicensesAndSummary({
    queryParams: { moduleType: ModuleName.CD as any },
    accountIdentifier: accountId
  })

  const trialBannerProps = {
    expiryTime: data?.data?.maxExpiryTime,
    licenseType: data?.data?.licenseType,
    module: ModuleName.CD,
    refetch
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

  const { trial, modal } = useQueryParams<{ trial?: boolean; modal?: boolean }>()
  const { selectedProject, currentUserInfo } = useAppStore()
  const { accounts, defaultAccountId } = currentUserInfo
  const createdFromNG = accounts?.find(account => account.uuid === defaultAccountId)?.createdFromNG
  const history = useHistory()

  const [pipelineData, setData] = React.useState<PagePMSPipelineSummaryResponse | undefined>()

  const { mutate: reloadPipelines, cancel } = useGetPipelineList({
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
      cancel()
      setData(await (await reloadPipelines({ filterType: 'PipelineSetup' })).data)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cancel]
  )

  React.useEffect(() => {
    cancel()
    fetchPipelines()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject?.identifier, selectedProject?.orgIdentifier])

  // get project lists via accountId
  const { data: projectListData } = useGetProjectList({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const projectsExist = projectListData?.data?.content?.length !== 0
  const pipelinesExist = pipelineData?.content?.length !== 0

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
      refetch()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trial]
  )

  useEffect(
    () => {
      if (modal) {
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
    [modal, selectedProject, projectsExist, pipelinesExist]
  )

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    return <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
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

  return (
    <HomePageTemplate
      title={getString('cd.continuous')}
      bgImageUrl={bgImageURL}
      subTitle={getString('cd.dashboard.subHeading')}
      documentText={getString('cd.learnMore')}
      trialBannerProps={trialBannerProps}
    />
  )
}

export default CDHomePage
