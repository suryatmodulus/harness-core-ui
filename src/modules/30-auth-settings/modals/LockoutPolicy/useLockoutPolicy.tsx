import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import type { LoginSettings } from 'services/cd-ng'
import LockoutPolicyForm from './views/LockoutPolicyForm'
import css from './useLockoutPolicy.module.scss'

interface Props {
  onSuccess: () => void
  loginSettings: LoginSettings
}
interface ModalReturn {
  openLockoutPolicyModal: (_editing: boolean) => void
  closeLockoutPolicyModal: () => void
}

export const useLockoutPolicyModal = ({ onSuccess, loginSettings }: Props): ModalReturn => {
  const [editing, setEditing] = React.useState(false)
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen enforceFocus={false} title="" onClose={hideModal} className={cx(css.dialog, Classes.DIALOG)}>
        <LockoutPolicyForm
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
    openLockoutPolicyModal: open,
    closeLockoutPolicyModal: hideModal
  }
}
