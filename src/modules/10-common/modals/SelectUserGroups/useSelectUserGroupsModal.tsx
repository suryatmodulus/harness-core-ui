import React, { useState } from 'react'
import { useModalHook } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import type { UserGroupDTO } from 'services/cd-ng'
import type { Scope } from '@common/interfaces/SecretsInterface'
import UserGroupsReference from '@common/components/UserGroupsReference/UserGroupsReference'
import { useStrings } from 'framework/strings'
import type { ScopeAndIdentifier } from '@common/components/MultiSelectEntityReference/MultiSelectEntityReference'
import css from './useSelectUserGroupsModal.module.scss'

export interface UseSelectUserGroupsModalProps {
  onSuccess?: (data: ScopeAndIdentifier[]) => void
  secretsListMockData?: UserGroupDTO[]
}

export interface UseSelectUserGroupsModalReturn {
  openSelectUserGroupsModal: (selectedUserGroups?: ScopeAndIdentifier[], scope?: Scope) => void
  closeSelectUserGroupsModal: () => void
}

const useSelectUserGroupsModal = (props: UseSelectUserGroupsModalProps): UseSelectUserGroupsModalReturn => {
  const { getString } = useStrings()
  const [selectedUserGroups, setSelectedUserGroups] = useState<ScopeAndIdentifier[]>()
  const [scope, setScope] = useState<Scope>()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        title={getString('common.selectUserGroups')}
        className={css.dialog}
      >
        <UserGroupsReference
          {...props}
          scope={scope}
          userGroupsScopeAndUuid={selectedUserGroups}
          mock={props.secretsListMockData}
          onSelect={data => {
            props.onSuccess?.(data)
            hideModal()
          }}
        />
      </Dialog>
    ),
    [selectedUserGroups, scope]
  )

  return {
    openSelectUserGroupsModal: (_selectedUserGroups: ScopeAndIdentifier[] | undefined, _scope: Scope | undefined) => {
      setSelectedUserGroups(_selectedUserGroups)
      setScope(_scope)
      showModal()
    },
    closeSelectUserGroupsModal: hideModal
  }
}

export default useSelectUserGroupsModal
