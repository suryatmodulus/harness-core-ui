import React, { useCallback, useState } from 'react'
import { useModalHook, Button, Container } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import Collaborators from './views/Collaborators'

import css from './useProjectModal.module.scss'

interface UseCollaboratorModalProps {
  projectIdentifier?: string
  orgIdentifier: string
}

export interface UseCollaboratorModalReturn {
  openCollaboratorModal: (props?: UseCollaboratorModalProps) => void
  closeCollaboratorModal: () => void
}

export const useCollaboratorModal = (): UseCollaboratorModalReturn => {
  const [projectIdentifier, setProjectIdentifier] = useState<string>()
  const [orgIdentifier, setOrgIdentifier] = useState<string>()

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen={true} onClose={hideModal} className={cx(css.dialog, Classes.DIALOG, css.collaborators)}>
        <Container padding="xxxlarge">
          <Collaborators projectIdentifier={projectIdentifier} orgIdentifier={orgIdentifier} />
          <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
        </Container>
      </Dialog>
    ),
    [projectIdentifier, orgIdentifier]
  )

  const open = useCallback(
    (props?: UseCollaboratorModalProps) => {
      setProjectIdentifier(props?.projectIdentifier)
      setOrgIdentifier(props?.orgIdentifier)
      showModal()
    },
    [showModal]
  )

  return {
    openCollaboratorModal: props => open(props),
    closeCollaboratorModal: hideModal
  }
}
