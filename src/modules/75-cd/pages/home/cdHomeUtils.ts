import type { Project, ModuleLicenseDTO } from 'services/cd-ng'
import { TrialType, UseCDTrialModalProps } from '@cd/modals/CDTrial/useCDTrialModal'
import { isCDCommunity } from 'framework/LicenseStore/LicenseStoreContext'
import routes from '@common/RouteDefinitions'
import { ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import type { Module } from '@common/interfaces/RouteInterfaces'

interface CDTrialModalProps {
  selectedProject?: Project
  openProjectModal: (project?: Project) => void
  pushToPipelineStudio: (pipelinId: string, projectData?: Project, search?: string) => void
}

interface OpenModalProps {
  modal?: ModuleLicenseType
  gettingProjects: boolean
  gettingPipelines: boolean
  selectedProject?: Project
  pipelinesExist: boolean
  projectsExist: boolean
  openProjectModal: (project?: Project) => void
  openCDTrialModal: () => void
  pushToPipelineStudio: (pipelinId: string, projectData?: Project, search?: string) => void
}

export const getCDTrialModalProps = (props: CDTrialModalProps): UseCDTrialModalProps => {
  const { selectedProject, openProjectModal, pushToPipelineStudio } = props
  return selectedProject
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
}

export function openModal(props: OpenModalProps): void {
  const {
    modal,
    gettingProjects,
    gettingPipelines,
    selectedProject,
    pipelinesExist,
    projectsExist,
    openProjectModal,
    openCDTrialModal,
    pushToPipelineStudio
  } = props
  if (modal && !gettingProjects && !gettingPipelines) {
    // selectedProject exists and no pipelines, forward to create pipeline
    if (selectedProject && !pipelinesExist) {
      pushToPipelineStudio('-1', selectedProject, `?modal=${modal}`)
    } else if (!selectedProject && !projectsExist) {
      // selectedProject doesnot exist and projects donot exist, open project modal
      openProjectModal()
    } else {
      // otherwise, just open cd trial modal
      openCDTrialModal()
    }
  }
}

interface ProjectCreateSuccessHandlerProps {
  project?: Project
  licenseInformation:
    | Record<string, undefined>
    | {
        [key: string]: ModuleLicenseDTO
      }
    | undefined
  experience?: ModuleLicenseType
  pushToPipelineStudio: (pipelinId: string, projectData?: Project, search?: string) => void
  push: (path: string) => void
  accountId: string
  module: Module
}

export function handleProjectCreateSuccess({
  project,
  licenseInformation,
  experience,
  pushToPipelineStudio,
  push,
  accountId,
  module
}: ProjectCreateSuccessHandlerProps): void {
  if (isCDCommunity(licenseInformation) && experience === ModuleLicenseType.COMMUNITY) {
    pushToPipelineStudio('-1', project, `?modal=${experience}`)
    return
  }

  if (project) {
    push(
      routes.toProjectOverview({
        projectIdentifier: project.identifier,
        orgIdentifier: project.orgIdentifier || /* istanbul ignore next */ '',
        accountId,
        module
      })
    )
  }
}
