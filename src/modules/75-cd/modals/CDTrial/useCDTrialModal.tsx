import React from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'

import CDTrial from './CDTrial'
import css from './useCDTrialModal.module.scss'

export interface UseCDTrialModalProps {
  onSuccess: () => void
  onCloseModal?: () => void
}

export interface UseCDTrialModalReturn {
  openCDTrialModal: () => void
  closeCDTrialModal: () => void
}

export const useCDTrialModal = ({ onSuccess, onCloseModal }: UseCDTrialModalProps): UseCDTrialModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        onClose={() => {
          hideModal()
          onCloseModal?.()
        }}
        className={cx(css.dialog, Classes.DIALOG, css.cdTrial)}
      >
        <CDTrial handleSubmit={onSuccess} closeModal={onCloseModal ? onCloseModal : hideModal} />
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
    openCDTrialModal: showModal,
    closeCDTrialModal: hideModal
  }
}
