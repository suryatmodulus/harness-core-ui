import React, { useCallback, useState } from 'react'
import { useModalHook, StepWizard, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import type { ModuleName } from 'framework/types/ModuleName'
import type { Project } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import { Views } from './Constants'
import { ProjectCollaboratorsStep } from './views/Collaborators'
import StepAboutProject from './views/StepAboutProject'
import EditProject from './views/EditProject'
import css from './useProjectModal.module.scss'

export interface UseProjectModalProps {
  onSuccess?: (projectData?: Project) => void
  onCloseModal?: () => void
  onWizardComplete?: (projectData?: Project) => void
  module?: ModuleName
}

export interface UseProjectModalReturn {
  openProjectModal: (project?: Project) => void
  closeProjectModal: () => void
}

export const useProjectModal = ({
  onSuccess,
  onCloseModal,
  onWizardComplete
}: UseProjectModalProps): UseProjectModalReturn => {
  const [view, setView] = useState(Views.CREATE)
  const [projectData, setProjectData] = useState<Project>()
  const [refreshProjects, setRefreshProjects] = useState(false)
  const { getString } = useStrings()

  const wizardCompleteHandler = async (wizardData: Project | undefined): Promise<void> => {
    if (!wizardData) {
      setProjectData(wizardData)
    }
    onWizardComplete?.(wizardData)
  }
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          if (refreshProjects) {
            onSuccess?.(projectData)
            setRefreshProjects(false)
          }
          onCloseModal?.()
          setView(Views.CREATE)
          hideModal()
        }}
        className={cx(css.dialog, Classes.DIALOG, {
          [css.create]: view === Views.CREATE
        })}
      >
        {view === Views.CREATE ? (
          <StepWizard<Project>
            onCompleteWizard={wizardCompleteHandler}
            onStepChange={() => {
              if (!refreshProjects) {
                setRefreshProjects(true)
              }
            }}
            stepClassName={css.stepClass}
          >
            <StepAboutProject name={getString('projectsOrgs.aboutProject')} modules={projectData?.modules} />
            <ProjectCollaboratorsStep name={getString('projectsOrgs.invite')} />
          </StepWizard>
        ) : null}

        {view === Views.EDIT ? (
          <EditProject
            identifier={projectData?.identifier}
            orgIdentifier={projectData?.orgIdentifier}
            closeModal={() => {
              hideModal()
              onSuccess?.(projectData)
            }}
          />
        ) : null}

        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            if (refreshProjects) {
              onSuccess?.(projectData)
              setRefreshProjects(false)
            }
            onCloseModal?.()
            setView(Views.CREATE)
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [view, projectData, refreshProjects]
  )

  const open = useCallback(
    (_project?: Project) => {
      setProjectData(_project)
      const isNew = !_project || !_project.identifier
      if (!isNew) {
        setView(Views.EDIT)
      } else setView(Views.CREATE)
      showModal()
    },
    [showModal]
  )

  return {
    openProjectModal: (project?: Project) => open(project),
    closeProjectModal: hideModal
  }
}
