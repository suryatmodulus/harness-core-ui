import React, { useCallback, useState } from 'react'
import { useModalHook, StepWizard, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import isEmpty from 'lodash/isEmpty'
import cx from 'classnames'
import type { ModuleName } from 'framework/types/ModuleName'
import type { Project } from 'services/cd-ng'
import i18n from '@projects-orgs/pages/projects/ProjectsPage.i18n'
import { Views } from './Constants'
import { ProjectCollaboratorsStep } from './views/Collaborators'
import PurposeList from './views/PurposeList'
import StepAboutProject from './views/StepAboutProject'
import EditProject from './views/EditProject'
import css from './useProjectModal.module.scss'

export interface UseProjectModalProps {
  onSuccess?: () => void
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
  onWizardComplete,
  module
}: UseProjectModalProps): UseProjectModalReturn => {
  const [view, setView] = useState(Views.CREATE)
  const [projectData, setProjectData] = useState<Project>()

  const wizardCompleteHandler = async (wizardData: Project | undefined): Promise<void> => {
    /* istanbul ignore else */ if (!wizardData || isEmpty(wizardData.modules)) {
      setView(Views.PURPOSE)
      setProjectData(wizardData)
    }
    onSuccess?.()
    onWizardComplete?.(wizardData)
  }
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        onClose={() => {
          setView(Views.CREATE)
          hideModal()
          onCloseModal ? onCloseModal() : null
        }}
        className={cx(css.dialog, Classes.DIALOG, {
          [css.create]: view === Views.CREATE,
          [css.purposeList]: view === Views.PURPOSE
        })}
      >
        {view === Views.CREATE ? (
          <StepWizard<Project> onCompleteWizard={wizardCompleteHandler} stepClassName={css.stepClass}>
            <StepAboutProject
              name={i18n.newProjectWizard.aboutProject.name}
              modules={projectData?.modules}
              onSuccess={onSuccess}
              module={module}
            />
            <ProjectCollaboratorsStep name={i18n.newProjectWizard.Collaborators.name} />
          </StepWizard>
        ) : null}

        {view === Views.PURPOSE ? <PurposeList data={projectData as Project} onSuccess={onSuccess} /> : null}

        {view === Views.EDIT ? (
          <EditProject
            identifier={projectData?.identifier}
            orgIdentifier={projectData?.orgIdentifier}
            closeModal={hideModal}
            onSuccess={onSuccess}
          />
        ) : null}

        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            setView(Views.CREATE)
            hideModal()
            onCloseModal ? onCloseModal() : null
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [view, projectData]
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
