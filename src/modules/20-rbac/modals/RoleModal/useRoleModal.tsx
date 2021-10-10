import React, { useCallback, useState } from 'react'
import { useModalHook, Dialog } from '@wings-software/uicore'
import { String } from 'framework/strings'
import type { Role } from 'services/rbac'
import RoleForm from './views/RoleForm'

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
        title={roleData ? <String stringID="editRole" /> : <String stringID="newRole" />}
        enforceFocus={false}
        onClose={hideModal}
      >
        <RoleForm
          data={roleData}
          isEdit={!!roleData}
          onSubmit={role => {
            onSuccess(role)
            hideModal()
          }}
          onCancel={hideModal}
        />
      </Dialog>
    ),
    [roleData, onSuccess]
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
