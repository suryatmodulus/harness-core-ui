import React, { useCallback, useState } from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'

import type { UserGroupAggregateDTO } from 'services/cd-ng'
import UserGroupForm from '@rbac/modals/UserGroupModal/views/UserGroupForm.tsx'
import css from './useUserGroupModal.module.scss'

export interface UseUserGroupModalProps {
  onSuccess: () => void
  onCloseModal?: () => void
}

export interface UseUserGroupModalReturn {
  openUserGroupModal: (userGroup?: UserGroupAggregateDTO) => void
  closeUserGroupModal: () => void
}

export const useUserGroupModal = ({ onSuccess }: UseUserGroupModalProps): UseUserGroupModalReturn => {
  const [userGroupData, setUserGroupData] = useState<UserGroupAggregateDTO>()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        onClose={() => {
          hideModal()
        }}
        className={cx(css.dialog, Classes.DIALOG)}
      >
        <UserGroupForm
          data={userGroupData?.userGroupDTO}
          isEdit={!!userGroupData}
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
    [userGroupData]
  )
  const open = useCallback(
    (_userGroup?: UserGroupAggregateDTO) => {
      setUserGroupData(_userGroup)
      showModal()
    },
    [showModal]
  )

  return {
    openUserGroupModal: (userGroup?: UserGroupAggregateDTO) => open(userGroup),
    closeUserGroupModal: hideModal
  }
}
