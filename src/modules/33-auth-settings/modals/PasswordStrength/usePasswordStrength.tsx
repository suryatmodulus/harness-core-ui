import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import type { LoginSettings } from 'services/cd-ng'
import PasswordStrengthForm from './views/PasswordStrengthForm'
import css from './usePasswordStrength.module.scss'

interface Props {
  onSuccess: () => void
  loginSettings: LoginSettings
}
interface ModalReturn {
  openPasswordStrengthModal: (_editing: boolean) => void
  closePasswordStrengthModal: () => void
}

export const usePasswordStrengthModal = ({ onSuccess, loginSettings }: Props): ModalReturn => {
  const [editing, setEditing] = React.useState(false)
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen title="" onClose={hideModal} className={cx(css.dialog, Classes.DIALOG)}>
        <PasswordStrengthForm
          onSubmit={() => {
            onSuccess()
            hideModal()
          }}
          onCancel={() => {
            hideModal()
          }}
          loginSettings={loginSettings}
          editing={editing}
        />
      </Dialog>
    ),
    [loginSettings, editing]
  )

  const open = React.useCallback(
    (_editing: boolean) => {
      setEditing(_editing)
      showModal()
    },
    [showModal]
  )

  return {
    openPasswordStrengthModal: open,
    closePasswordStrengthModal: hideModal
  }
}
