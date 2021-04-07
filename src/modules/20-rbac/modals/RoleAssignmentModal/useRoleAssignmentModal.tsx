import React, { useCallback, useState } from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'

import type { UserSearchDTO, RoleBinding, UserGroupDTO } from 'services/cd-ng'
import UserRoleAssignment from './views/UserRoleAssigment'
import UserGroupRoleAssignment from './views/UserGroupRoleAssignment'
import css from './useRoleAssignmentModal.module.scss'

export interface UseRoleAssignmentModalProps {
  onSuccess: () => void
}

export enum PrincipalType {
  USER = 'USER',
  USER_GROUP = 'USER_GROUP'
}

export interface UseRoleAssignmentModalReturn {
  openRoleAssignmentModal: (
    type?: PrincipalType,
    principalInfo?: UserGroupDTO | UserSearchDTO,
    roleBindings?: RoleBinding[]
  ) => void
  closeRoleAssignmentModal: () => void
}

export const useRoleAssignmentModal = ({ onSuccess }: UseRoleAssignmentModalProps): UseRoleAssignmentModalReturn => {
  const [roleBindings, setRoleBindings] = useState<RoleBinding[]>()
  const [principalInfo, setPrincipalInfo] = useState<UserSearchDTO | UserGroupDTO>()
  const [principal, setPrincipal] = useState<PrincipalType>(PrincipalType.USER)
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        onClose={() => {
          hideModal()
        }}
        className={cx(css.dialog, Classes.DIALOG)}
      >
        {principal === PrincipalType.USER ? (
          <UserRoleAssignment
            roleBindings={roleBindings}
            user={principalInfo as UserSearchDTO}
            isInvite={!principalInfo}
            onSubmit={() => {
              onSuccess()
              hideModal()
            }}
          />
        ) : (
          <UserGroupRoleAssignment
            roleBindings={roleBindings}
            userGroup={principalInfo as UserGroupDTO}
            onSubmit={() => {
              onSuccess()
              hideModal()
            }}
          />
        )}

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
    [roleBindings, principalInfo]
  )
  const open = useCallback(
    (_type?: PrincipalType, _principalInfo?: UserGroupDTO | UserSearchDTO, _roleBindings?: RoleBinding[]) => {
      if (_type) setPrincipal(_type)
      setRoleBindings(_roleBindings)
      setPrincipalInfo(_principalInfo)
      showModal()
    },
    [showModal]
  )

  return {
    openRoleAssignmentModal: (
      _type?: PrincipalType,
      _principalInfo?: UserGroupDTO | UserSearchDTO,
      _roleBindings?: RoleBinding[]
    ) => open(_type, _principalInfo, _roleBindings),
    closeRoleAssignmentModal: hideModal
  }
}
