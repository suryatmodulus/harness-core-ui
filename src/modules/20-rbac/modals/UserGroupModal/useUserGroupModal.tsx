import React, { useCallback, useState } from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'

import type { UserGroupDTO } from 'services/cd-ng'
import UserGroupForm from '@rbac/modals/UserGroupModal/views/UserGroupForm'
import css from './useUserGroupModal.module.scss'

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
        <UserGroupForm
          data={userGroupData}
          isEdit={!!userGroupData && !isAddMember}
          isAddMember={isAddMember}
          onSubmit={() => {
            onSuccess()
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
