import type { Project } from 'services/cd-ng'
import { TrialType, UseCDTrialModalProps } from '@cd/modals/CDTrial/useCDTrialModal'

interface CDTrialModalProps {
  selectedProject?: Project
  openProjectModal: (project?: Project) => void
  pushToPipelineStudio: (pipelinId: string, projectData?: Project, search?: string) => void
}

interface OpenModalProps {
  modal?: string
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
      pushToPipelineStudio('-1', selectedProject)
    } else if (!selectedProject && !projectsExist) {
      // selectedProject doesnot exist and projects donot exist, open project modal
      openProjectModal()
    } else {
      // otherwise, just open cd trial modal
      openCDTrialModal()
    }
  }
}
