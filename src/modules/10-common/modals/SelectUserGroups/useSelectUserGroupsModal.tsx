import React, { useState } from 'react'
import { useModalHook } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import type { UserGroupDTO } from 'services/cd-ng'
import type { Scope } from '@common/interfaces/SecretsInterface'
import UserGroupsReference from '@common/components/UserGroupsReference/UserGroupsReference'
import css from './useSelectUserGroupsModal.module.scss'

export interface UseSelectUserGroupsModalProps {
  onSuccess?: (userGroups: UserGroupDTO[]) => void
  secretsListMockData?: UserGroupDTO[]
}

export interface UseSelectUserGroupsModalReturn {
  openSelectUserGroupsModal: (selectedUserGroups?: UserGroupDTO[], scope?: Scope) => void
  closeSelectUserGroupsModal: () => void
}

const useSelectUserGroupsModal = (props: UseSelectUserGroupsModalProps): UseSelectUserGroupsModalReturn => {
  const [selectedUserGroups, setSelectedUserGroups] = useState<UserGroupDTO[]>()
  const [scope, setScope] = useState<Scope>()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        className={css.dialog}
      >
        <UserGroupsReference
          {...props}
          scope={scope}
          userGroups={selectedUserGroups}
          mock={props.secretsListMockData}
          onSelect={userGroups => {
            props.onSuccess?.(userGroups)
            hideModal()
          }}
          onCancel={() => hideModal()}
        />
      </Dialog>
    ),
    [selectedUserGroups, scope]
  )

  return {
    openSelectUserGroupsModal: (_selectedUserGroups: UserGroupDTO[] | undefined, _scope: Scope | undefined) => {
      setSelectedUserGroups(_selectedUserGroups)
      setScope(_scope)
      showModal()
    },
    closeSelectUserGroupsModal: hideModal
  }
}

export default useSelectUserGroupsModal
