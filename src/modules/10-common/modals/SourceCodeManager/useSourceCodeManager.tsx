import React from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import SourceCodeManagerForm from './views/SourceCodeManagerForm'
import css from './useSourceCodeManager.module.scss'

export interface UseSourceCodeModalProps {
  onSuccess: () => void
  onCloseModal?: () => void
}

export interface UseSourceCodeModalReturn {
  openSourceCodeModal: () => void
  closeSourceCodeModal: () => void
}

export const useSourceCodeModal = ({ onSuccess }: UseSourceCodeModalProps): UseSourceCodeModalReturn => {
  const [showModal, hideModal] = useModalHook(() => (
    <Dialog
      isOpen={true}
      onClose={() => {
        hideModal()
      }}
      className={cx(css.dialog, Classes.DIALOG)}
    >
      <SourceCodeManagerForm
        onSubmit={() => {
          onSuccess()
          hideModal()
        }}
        onClose={hideModal}
      />

      <Button
        minimal
        icon="cross"
        iconProps={{ size: 18 }}
        onClick={() => {
          hideModal()
        }}
        className={css.crossIcon}
      />
    </Dialog>
  ))

  return {
    openSourceCodeModal: showModal,
    closeSourceCodeModal: hideModal
  }
}
