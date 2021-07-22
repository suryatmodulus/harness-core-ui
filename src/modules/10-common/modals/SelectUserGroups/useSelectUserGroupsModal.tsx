import React, { useState } from 'react'
import { useModalHook, Button, Text, Color } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import type { UserGroupDTO } from 'services/cd-ng'
import type { Scope } from '@common/interfaces/SecretsInterface'
import UserGroupsReference from '@common/components/UserGroupsReference/UserGroupsReference'
import type { ScopeAndUuid } from '@common/components/EntityReference/EntityReference'
import { useStrings } from 'framework/strings'
import css from './useSelectUserGroupsModal.module.scss'

export interface UseSelectUserGroupsModalProps {
  onSuccess?: (userGroups: UserGroupDTO[]) => void
  secretsListMockData?: UserGroupDTO[]
}

export interface UseSelectUserGroupsModalReturn {
  openSelectUserGroupsModal: (selectedUserGroups?: ScopeAndUuid[], scope?: Scope) => void
  closeSelectUserGroupsModal: () => void
}

const useSelectUserGroupsModal = (props: UseSelectUserGroupsModalProps): UseSelectUserGroupsModalReturn => {
  const { getString } = useStrings()
  const [selectedUserGroups, setSelectedUserGroups] = useState<ScopeAndUuid[]>()
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
        <Text color={Color.BLACK} padding={{ top: 'medium', left: 'small' }}>
          {getString('common.selectUserGroups')}
        </Text>
        <UserGroupsReference
          {...props}
          scope={scope}
          userGroupsScopeAndUuid={selectedUserGroups}
          mock={props.secretsListMockData}
          onSelect={userGroups => {
            props.onSuccess?.(userGroups)
            hideModal()
          }}
        />
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
      </Dialog>
    ),
    [selectedUserGroups, scope]
  )

  return {
    openSelectUserGroupsModal: (_selectedUserGroups: ScopeAndUuid[] | undefined, _scope: Scope | undefined) => {
      setSelectedUserGroups(_selectedUserGroups)
      setScope(_scope)
      showModal()
    },
    closeSelectUserGroupsModal: hideModal
  }
}

export default useSelectUserGroupsModal
