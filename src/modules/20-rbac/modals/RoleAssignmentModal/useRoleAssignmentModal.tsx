import React, { useCallback, useState } from 'react'
import { useModalHook, Dialog } from '@wings-software/uicore'
import type { IDialogProps } from '@blueprintjs/core'
import { String } from 'framework/strings'
import type { UserMetadataDTO, RoleAssignmentMetadataDTO, UserGroupDTO, ServiceAccountDTO } from 'services/cd-ng'
import UserRoleAssignment from '@rbac/modals/RoleAssignmentModal/views/UserRoleAssigment'
import type { StringsMap } from 'framework/strings/StringsContext'
import RoleAssignment from '@rbac/modals/RoleAssignmentModal/views/RoleAssignment'
import { PrincipalType } from '@rbac/utils/utils'

export interface UseRoleAssignmentModalProps {
  onSuccess: () => void
  onUserAdded?: () => void
}

export interface UseRoleAssignmentModalReturn {
  openRoleAssignmentModal: (
    type?: PrincipalType,
    principalInfo?: UserGroupDTO | UserMetadataDTO | ServiceAccountDTO,
    roleBindings?: RoleAssignmentMetadataDTO[]
  ) => void
  closeRoleAssignmentModal: () => void
}

const getTitle = (principal: PrincipalType, isInvite: boolean): keyof StringsMap => {
  if (principal === PrincipalType.USER && isInvite) {
    return 'rbac.usersPage.userForm.title'
  }
  return 'rbac.addRole'
}

export const useRoleAssignmentModal = ({
  onSuccess,
  onUserAdded
}: UseRoleAssignmentModalProps): UseRoleAssignmentModalReturn => {
  const [roleBindings, setRoleBindings] = useState<RoleAssignmentMetadataDTO[]>()
  const [principalInfo, setPrincipalInfo] = useState<UserMetadataDTO | UserGroupDTO | ServiceAccountDTO>()
  const [principal, setPrincipal] = useState<PrincipalType>(PrincipalType.USER)
  const modalProps: IDialogProps = {
    isOpen: true,
    title: <String stringID={getTitle(principal, !principalInfo)} />,
    enforceFocus: false,
    style: {
      width: 600
    }
  }
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog onClose={hideModal} {...modalProps}>
        <>
          {principal === PrincipalType.USER ? (
            <UserRoleAssignment
              roleBindings={roleBindings}
              user={principalInfo as UserMetadataDTO}
              isInvite={!principalInfo}
              onSubmit={() => {
                onSuccess()
                hideModal()
              }}
              onUserAdded={() => {
                onUserAdded?.()
                hideModal()
              }}
              onSuccess={onSuccess}
              onCancel={hideModal}
            />
          ) : null}
          {principal === PrincipalType.USER_GROUP ? (
            <RoleAssignment
              roleBindings={roleBindings}
              type={PrincipalType.USER_GROUP}
              principalInfo={principalInfo as UserGroupDTO}
              onSubmit={() => {
                onSuccess()
                hideModal()
              }}
              onSuccess={onSuccess}
              onCancel={hideModal}
            />
          ) : null}

          {principal === PrincipalType.SERVICE ? (
            <RoleAssignment
              roleBindings={roleBindings}
              type={PrincipalType.SERVICE}
              principalInfo={principalInfo as ServiceAccountDTO}
              onSubmit={() => {
                onSuccess()
                hideModal()
              }}
              onSuccess={onSuccess}
              onCancel={hideModal}
            />
          ) : null}
        </>
      </Dialog>
    ),
    [roleBindings, principal, principalInfo, onSuccess]
  )
  const open = useCallback(
    (
      _type?: PrincipalType,
      _principalInfo?: UserGroupDTO | UserMetadataDTO | ServiceAccountDTO,
      _roleBindings?: RoleAssignmentMetadataDTO[]
    ) => {
      if (_type) setPrincipal(_type)
      setRoleBindings(_roleBindings)
      setPrincipalInfo(_principalInfo)
      showModal()
    },
    [showModal]
  )

  return {
    openRoleAssignmentModal: open,
    closeRoleAssignmentModal: hideModal
  }
}
