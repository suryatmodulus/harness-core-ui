import React from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'

import CITrial from './CITrial'
import css from './useCITrialModal.module.scss'

export interface UseCITrialModalProps {
  onCreateSuccess: () => void
  onSelectSuccess: () => void
  onCloseModal?: () => void
  isSelect?: boolean
}

export interface UseCITrialModalReturn {
  openCITrialModal: () => void
  closeCITrialModal: () => void
}

export const useCITrialModal = ({
  onCreateSuccess,
  onSelectSuccess,
  onCloseModal,
  isSelect = false
}: UseCITrialModalProps): UseCITrialModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        onClose={() => {
          hideModal()
          onCloseModal?.()
        }}
        className={cx(css.dialog, Classes.DIALOG, css.ciTrial)}
      >
        <CITrial
          isSelect={isSelect}
          handleCreateSubmit={onCreateSuccess}
          handleSelectSubmit={onSelectSuccess}
          closeModal={onCloseModal ? onCloseModal : hideModal}
        />
        <Button
          aria-label="close modal"
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal()
            onCloseModal?.()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    []
  )

  return {
    openCITrialModal: showModal,
    closeCITrialModal: hideModal
  }
}
