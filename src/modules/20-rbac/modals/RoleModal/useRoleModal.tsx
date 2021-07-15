import React, { useCallback, useState } from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'

import type { Role } from 'services/rbac'
import RoleForm from './views/RoleForm'
import css from './useRoleModal.module.scss'

export interface UseRoleModalProps {
  onSuccess: (role: Role) => void
  onCloseModal?: () => void
}

export interface UseRoleModalReturn {
  openRoleModal: (role?: Role) => void
  closeRoleModal: () => void
}

export const useRoleModal = ({ onSuccess }: UseRoleModalProps): UseRoleModalReturn => {
  const [roleData, setRoleData] = useState<Role>()
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
        <RoleForm
          data={roleData}
          isEdit={!!roleData}
          onSubmit={role => {
            onSuccess(role)
            hideModal()
          }}
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
    [roleData]
  )
  const open = useCallback(
    (_role?: Role) => {
      setRoleData(_role)
      showModal()
    },
    [showModal]
  )

  return {
    openRoleModal: (role?: Role) => open(role),
    closeRoleModal: hideModal
  }
}
