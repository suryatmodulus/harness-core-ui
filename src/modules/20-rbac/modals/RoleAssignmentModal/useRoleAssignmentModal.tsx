import React, { useCallback, useState } from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'

import type { UserMetadataDTO, RoleAssignmentMetadataDTO, UserGroupDTO, ServiceAccountDTO } from 'services/cd-ng'
import UserRoleAssignment from '@rbac/modals/RoleAssignmentModal/views/UserRoleAssigment'
import UserGroupRoleAssignment from '@rbac/modals/RoleAssignmentModal/views/UserGroupRoleAssignment'
import ServiceAccountRoleAssignment from '@rbac/modals/RoleAssignmentModal/views/ServiceAccountRoleAssignment'
import css from './useRoleAssignmentModal.module.scss'

export interface UseRoleAssignmentModalProps {
  onSuccess: () => void
}

export enum PrincipalType {
  USER = 'USER',
  USER_GROUP = 'USER_GROUP',
  SERVICE = 'SERVICE'
}

export interface UseRoleAssignmentModalReturn {
  openRoleAssignmentModal: (
    type?: PrincipalType,
    principalInfo?: UserGroupDTO | UserMetadataDTO | ServiceAccountDTO,
    roleBindings?: RoleAssignmentMetadataDTO[]
  ) => void
  closeRoleAssignmentModal: () => void
}

export const useRoleAssignmentModal = ({ onSuccess }: UseRoleAssignmentModalProps): UseRoleAssignmentModalReturn => {
  const [roleBindings, setRoleBindings] = useState<RoleAssignmentMetadataDTO[]>()
  const [principalInfo, setPrincipalInfo] = useState<UserMetadataDTO | UserGroupDTO | ServiceAccountDTO>()
  const [principal, setPrincipal] = useState<PrincipalType>(PrincipalType.USER)
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen={true} onClose={hideModal} enforceFocus={false} className={cx(css.dialog, Classes.DIALOG)}>
        {principal === PrincipalType.USER ? (
          <UserRoleAssignment
            roleBindings={roleBindings}
            user={principalInfo as UserMetadataDTO}
            isInvite={!principalInfo}
            onSubmit={() => {
              onSuccess()
              hideModal()
            }}
            onSuccess={onSuccess}
          />
        ) : null}
        {principal === PrincipalType.USER_GROUP ? (
          <UserGroupRoleAssignment
            roleBindings={roleBindings}
            userGroup={principalInfo as UserGroupDTO}
            onSubmit={() => {
              onSuccess()
              hideModal()
            }}
            onSuccess={onSuccess}
          />
        ) : null}

        {principal === PrincipalType.SERVICE ? (
          <ServiceAccountRoleAssignment
            roleBindings={roleBindings}
            serviceAccount={principalInfo as ServiceAccountDTO}
            onSubmit={() => {
              onSuccess()
              hideModal()
            }}
            onSuccess={onSuccess}
          />
        ) : null}

        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
      </Dialog>
    ),
    [roleBindings, principalInfo, onSuccess]
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
