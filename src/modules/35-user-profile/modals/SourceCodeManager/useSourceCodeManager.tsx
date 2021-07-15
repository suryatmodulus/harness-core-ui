import React from 'react'
import cx from 'classnames'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import type { SourceCodeManagerDTO } from 'services/cd-ng'
import SourceCodeManagerForm from './views/SourceCodeManagerForm'
import css from './useSourceCodeManager.module.scss'

export interface UseSourceCodeModalProps {
  onSuccess: () => void
  onCloseModal?: () => void
  initialValues?: SourceCodeManagerDTO
}

export interface UseSourceCodeModalReturn {
  openSourceCodeModal: () => void
  closeSourceCodeModal: () => void
}

export const useSourceCodeModal = ({ onSuccess, initialValues }: UseSourceCodeModalProps): UseSourceCodeModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        className={cx(css.dialog, Classes.DIALOG)}
      >
        <SourceCodeManagerForm
          initialValues={initialValues}
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
    ),
    [onSuccess, initialValues]
  )

  return {
    openSourceCodeModal: showModal,
    closeSourceCodeModal: hideModal
  }
}
