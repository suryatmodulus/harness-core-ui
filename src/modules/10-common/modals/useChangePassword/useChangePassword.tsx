import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import ChangePasswordForm from './views/ChangePasswordForm'
import css from './useChangePassword.module.scss'

interface ModalReturn {
  openPasswordModal: () => void
  closePasswordModal: () => void
}

export const useChangePassword = (): ModalReturn => {
  const [showModal, hideModal] = useModalHook(() => (
    <Dialog isOpen title="" onClose={hideModal} className={cx(css.dialog, Classes.DIALOG)}>
      <ChangePasswordForm hideModal={hideModal} />
    </Dialog>
  ))

  return {
    openPasswordModal: () => showModal(),
    closePasswordModal: hideModal
  }
}
