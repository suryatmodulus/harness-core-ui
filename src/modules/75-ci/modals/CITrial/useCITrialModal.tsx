import React from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import type { NgPipeline } from 'services/cd-ng'

import CITrial from './CITrial'
import css from './useCITrialModal.module.scss'

type onCreateSuccess = (data: NgPipeline) => void
type onSelectSuccess = () => void

interface DialogProps {
  onClose: () => void
  onSubmit: (values: NgPipeline) => void
  isSelect: boolean
}
export interface UseCITrialModalProps {
  onSubmit: onCreateSuccess | onSelectSuccess
  onCloseModal?: () => void
  isSelect?: boolean
}

export interface UseCITrialModalReturn {
  openCITrialModal: () => void
  closeCITrialModal: () => void
}

const CITrialDialog = ({ onClose, onSubmit, isSelect }: DialogProps): React.ReactElement => (
  <Dialog isOpen={true} onClose={onClose} className={cx(css.dialog, Classes.DIALOG, css.ciTrial)}>
    <CITrial isSelect={isSelect} onSubmit={onSubmit} closeModal={onClose} />
    <Button
      aria-label="close modal"
      minimal
      icon="cross"
      iconProps={{ size: 18 }}
      onClick={onClose}
      className={css.crossIcon}
    />
  </Dialog>
)

export const getCITrialModal = (
  onSubmit: (values: NgPipeline) => void,
  onClose: () => void,
  isSelect: boolean
): React.ReactElement => {
  return <CITrialDialog onSubmit={onSubmit} onClose={onClose} isSelect={isSelect} />
}

export const useCITrialModal = ({
  onSubmit,
  onCloseModal,
  isSelect = false
}: UseCITrialModalProps): UseCITrialModalReturn => {
  const [showModal, hideModal] = useModalHook(() => (
    <Dialog
      isOpen={true}
      onClose={() => {
        hideModal()
        onCloseModal?.()
      }}
      className={cx(css.dialog, Classes.DIALOG, css.ciTrial)}
    >
      <CITrial isSelect={isSelect} onSubmit={onSubmit} closeModal={onCloseModal ? onCloseModal : hideModal} />
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
  ))

  return {
    openCITrialModal: showModal,
    closeCITrialModal: hideModal
  }
}
