import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import type { PasswordStrengthPolicy } from 'services/cd-ng'
import ChangePasswordForm from './views/ChangePasswordForm'
import css from './useChangePassword.module.scss'
interface ModalReturn {
  openPasswordModal: (_passwordStrengthPolicy?: PasswordStrengthPolicy) => void
  closePasswordModal: () => void
}

export const useChangePassword = (): ModalReturn => {
  const [passwordStrengthPolicy, setPasswordStrengthPolicy] = React.useState<PasswordStrengthPolicy>()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen title="" onClose={hideModal} className={cx(css.dialog, Classes.DIALOG)}>
        {passwordStrengthPolicy && (
          <ChangePasswordForm hideModal={hideModal} passwordStrengthPolicy={passwordStrengthPolicy} />
        )}
      </Dialog>
    ),
    [passwordStrengthPolicy]
  )

  const open = (_passwordStrengthPolicy?: PasswordStrengthPolicy): void => {
    setPasswordStrengthPolicy(_passwordStrengthPolicy)
    showModal()
  }

  return {
    openPasswordModal: open,
    closePasswordModal: hideModal
  }
}
