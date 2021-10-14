import React, { useCallback, useState } from 'react'
import { useModalHook, Dialog } from '@wings-software/uicore'

import type { UserGroupDTO } from 'services/cd-ng'
import UserGroupForm from '@rbac/modals/UserGroupModal/views/UserGroupForm'
import { useStrings } from 'framework/strings'

export interface UseUserGroupModalProps {
  onSuccess: () => void
  onCloseModal?: () => void
}

export interface UseUserGroupModalReturn {
  openUserGroupModal: (userGroup?: UserGroupDTO, _isAddMember?: boolean) => void
  closeUserGroupModal: () => void
}

export const useUserGroupModal = ({ onSuccess }: UseUserGroupModalProps): UseUserGroupModalReturn => {
  const [userGroupData, setUserGroupData] = useState<UserGroupDTO>()
  const [isAddMember, setIsAddMember] = useState<boolean>(false)
  const { getString } = useStrings()
  const getTitle = (): string => {
    if (!!userGroupData && !isAddMember) {
      return getString('rbac.userGroupPage.editUserGroup')
    }
    if (isAddMember) {
      return getString('rbac.userGroupPage.addMembers')
    }
    return getString('rbac.userGroupPage.newUserGroup')
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen={true} enforceFocus={false} title={getTitle()} onClose={hideModal}>
        <UserGroupForm
          data={userGroupData}
          isEdit={!!userGroupData && !isAddMember}
          isAddMember={isAddMember}
          onSubmit={() => {
            onSuccess()
            hideModal()
          }}
          onCancel={hideModal}
        />
      </Dialog>
    ),
    [userGroupData, isAddMember]
  )
  const open = useCallback(
    (_userGroup?: UserGroupDTO, _isAddMember?: boolean) => {
      setUserGroupData(_userGroup)
      setIsAddMember(_isAddMember || false)
      showModal()
    },
    [showModal]
  )

  return {
    openUserGroupModal: (userGroup?: UserGroupDTO, _isAddMember?: boolean) => open(userGroup, _isAddMember),
    closeUserGroupModal: hideModal
  }
}
