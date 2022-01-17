/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo } from 'react'
import {
  Text,
  Layout,
  Button,
  Popover,
  Color,
  ButtonVariation,
  Icon,
  FontVariation,
  TableV2,
  useConfirmationDialog,
  useToaster
} from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import { Classes, Position, Menu, Intent, PopoverInteractionKind, IconName, MenuItem } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import {
  UserGroupAggregateDTO,
  useDeleteUserGroup,
  ResponsePageUserGroupAggregateDTO,
  UserGroupDTO,
  UserMetadataDTO,
  RoleAssignmentMetadataDTO
} from 'services/cd-ng'
import { useStrings, String } from 'framework/strings'
import RoleBindingsList from '@rbac/components/RoleBindingsList/RoleBindingsList'
import { PrincipalType } from '@rbac/utils/utils'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import ManagePrincipalButton from '@rbac/components/ManagePrincipalButton/ManagePrincipalButton'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import RbacAvatarGroup from '@rbac/components/RbacAvatarGroup/RbacAvatarGroup'
import { isCDCommunity, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import css from './UserGroupsListView.module.scss'

interface UserGroupsListViewProps {
  data: ResponsePageUserGroupAggregateDTO | null
  gotoPage: (index: number) => void
  reload: () => Promise<void>
  openRoleAssignmentModal: (
    type?: PrincipalType,
    principalInfo?: UserGroupDTO | UserMetadataDTO,
    roleBindings?: RoleAssignmentMetadataDTO[]
  ) => void
  openUserGroupModal: (userGroup?: UserGroupDTO, _isAddMember?: boolean) => void
}

export const UserGroupColumn = (data: UserGroupDTO): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
        <Layout.Horizontal spacing="medium">
          <Text color={Color.BLACK} lineClamp={1}>
            {data.name}
          </Text>
          {data.ssoLinked ? (
            <Popover interactionKind={PopoverInteractionKind.HOVER}>
              <Icon name="link" color={Color.BLUE_500} size={10} />
              <Layout.Vertical spacing="xsmall" padding="medium">
                <Layout.Horizontal spacing="xsmall">
                  <Text color={Color.BLACK}>
                    <String stringID="rbac.userDetails.linkToSSOProviderModal.saml" />
                  </Text>
                  <Text lineClamp={1}>{data.linkedSsoDisplayName}</Text>
                </Layout.Horizontal>
                <Layout.Horizontal spacing="xsmall">
                  <Text color={Color.BLACK}>
                    <String stringID="rbac.userDetails.linkToSSOProviderModal.group" />
                  </Text>
                  <Text lineClamp={1}>{data.ssoGroupName}</Text>
                </Layout.Horizontal>
              </Layout.Vertical>
            </Popover>
          ) : null}
        </Layout.Horizontal>
        <Text color={Color.GREY_600} lineClamp={1} font={{ variation: FontVariation.SMALL }}>
          {getString('idLabel', { id: data.identifier })}
        </Text>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

const RenderColumnUserGroup: Renderer<CellProps<UserGroupAggregateDTO>> = ({ row }) => {
  const data = row.original.userGroupDTO
  return UserGroupColumn(data)
}

const RenderColumnMembers: Renderer<CellProps<UserGroupAggregateDTO>> = ({ row, column }) => {
  const data = row.original
  const { accountIdentifier, orgIdentifier, projectIdentifier, identifier } = data.userGroupDTO
  const { getString } = useStrings()
  const avatars =
    data.users?.map(user => {
      return { email: user.email, name: user.name }
    }) || []

  const handleAddMember = (e: React.MouseEvent<HTMLElement | Element, MouseEvent>): void => {
    e.stopPropagation()
    ;(column as any).openUserGroupModal(data.userGroupDTO, true)
  }

  const disableTooltipText = data.userGroupDTO.ssoLinked
    ? getString('rbac.userDetails.linkToSSOProviderModal.btnDisabledTooltipText')
    : undefined
  const avatarTooltip = disableTooltipText ? <Text padding="medium">{disableTooltipText}</Text> : undefined

  return avatars.length ? (
    <RbacAvatarGroup
      avatars={avatars}
      restrictLengthTo={6}
      onAdd={handleAddMember}
      permission={{
        resourceScope: {
          accountIdentifier,
          orgIdentifier,
          projectIdentifier
        },
        resource: {
          resourceType: ResourceType.USERGROUP,
          resourceIdentifier: identifier
        },
        permission: PermissionIdentifier.MANAGE_USERGROUP
      }}
      disabled={data.userGroupDTO.ssoLinked}
      onAddTooltip={avatarTooltip}
    />
  ) : (
    <Layout.Horizontal>
      <ManagePrincipalButton
        text={getString('plusNumber', { number: getString('members') })}
        variation={ButtonVariation.LINK}
        onClick={handleAddMember}
        className={css.roleButton}
        resourceType={ResourceType.USERGROUP}
        resourceIdentifier={identifier}
        disabled={data.userGroupDTO.ssoLinked}
        tooltip={disableTooltipText}
      />
    </Layout.Horizontal>
  )
}

const RenderColumnRoleAssignments: Renderer<CellProps<UserGroupAggregateDTO>> = ({ row, column }) => {
  const data = row.original.roleAssignmentsMetadataDTO
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <RoleBindingsList data={data} length={2} />
      <ManagePrincipalButton
        text={getString('common.plusNumber', { number: getString('common.role') })}
        variation={ButtonVariation.LINK}
        data-testid={`addRole-${row.original.userGroupDTO.identifier}`}
        className={css.roleButton}
        onClick={event => {
          event.stopPropagation()
          ;(column as any).openRoleAssignmentModal(
            PrincipalType.USER_GROUP,
            row.original.userGroupDTO,
            row.original.roleAssignmentsMetadataDTO
          )
        }}
        resourceType={ResourceType.USERGROUP}
        resourceIdentifier={row.original.userGroupDTO.identifier}
      />
    </Layout.Horizontal>
  )
}

const RenderColumnMenu: Renderer<CellProps<UserGroupAggregateDTO>> = ({ row, column }) => {
  const data = row.original.userGroupDTO
  const { accountIdentifier, orgIdentifier, projectIdentifier, identifier } = data
  const [menuOpen, setMenuOpen] = useState(false)
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { mutate: deleteUserGroup } = useDeleteUserGroup({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier }
  })
  const permissionRequest = {
    resourceScope: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier
    },
    resource: {
      resourceType: ResourceType.USERGROUP,
      resourceIdentifier: identifier
    },
    permission: PermissionIdentifier.MANAGE_USERGROUP
  }

  const { openDialog: openDeleteDialog } = useConfirmationDialog({
    contentText: getString('rbac.userGroupPage.confirmDelete', { name: data.name }),
    titleText: getString('rbac.userGroupPage.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const deleted = await deleteUserGroup(identifier, {
            headers: { 'content-type': 'application/json' }
          })
          /* istanbul ignore else */ if (deleted) {
            showSuccess(getString('rbac.userGroupPage.successMessage', { name: data.name }))
            ;(column as any).reload()
          } else {
            showError(getString('deleteError'))
          }
        } catch (err) {
          /* istanbul ignore next */
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    openDeleteDialog()
  }

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    ;(column as any).openUserGroupModal(data)
  }

  const renderMenuItem = (
    icon: IconName,
    text: string,
    clickHandler: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void,
    tooltipText: string
  ): React.ReactElement => {
    if (data.externallyManaged) {
      return (
        <Popover
          position={Position.TOP}
          fill
          usePortal
          inheritDarkTheme={false}
          interactionKind={PopoverInteractionKind.HOVER}
          hoverCloseDelay={50}
          content={
            <div className={css.popover}>
              <Text font={{ variation: FontVariation.SMALL }}>{tooltipText}</Text>
            </div>
          }
        >
          <div
            onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
              event.stopPropagation()
            }}
          >
            <MenuItem icon={icon} text={text} onClick={clickHandler} disabled />
          </div>
        </Popover>
      )
    }
    return <RbacMenuItem icon={icon} text={text} onClick={clickHandler} permission={permissionRequest} />
  }

  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          minimal
          icon="Options"
          data-testid={`menu-${data.identifier}`}
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu>
          {renderMenuItem(
            'edit',
            getString('edit'),
            handleEdit,
            getString('rbac.manageSCIMText', {
              action: getString('edit').toLowerCase(),
              target: getString('rbac.group').toLowerCase()
            })
          )}
          {renderMenuItem(
            'trash',
            getString('delete'),
            handleDelete,
            getString('rbac.manageSCIMText', {
              action: getString('delete').toLowerCase(),
              target: getString('rbac.group').toLowerCase()
            })
          )}
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const UserGroupsListView: React.FC<UserGroupsListViewProps> = props => {
  const { data, gotoPage, reload, openRoleAssignmentModal, openUserGroupModal } = props
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const { licenseInformation } = useLicenseStore()
  const isCommunity = isCDCommunity(licenseInformation)
  const history = useHistory()
  const columns: Column<UserGroupAggregateDTO>[] = useMemo(
    () => [
      {
        Header: getString('common.userGroup'),
        id: 'userGroup',
        accessor: row => row.userGroupDTO.name,
        width: '30%',
        Cell: RenderColumnUserGroup
      },
      {
        Header: getString('members'),
        id: 'members',
        accessor: row => row.users,
        width: '30%',
        openUserGroupModal: openUserGroupModal,
        Cell: RenderColumnMembers
      },
      {
        Header: isCommunity ? '' : getString('rbac.roleBinding'),
        id: 'roleBindings',
        accessor: row => row.roleAssignmentsMetadataDTO,
        width: '35%',
        Cell: isCommunity ? () => noop : RenderColumnRoleAssignments,
        openRoleAssignmentModal: openRoleAssignmentModal
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.userGroupDTO.identifier,
        width: '5%',
        Cell: RenderColumnMenu,
        reload: reload,
        openUserGroupModal: openUserGroupModal,
        disableSortBy: true
      }
    ],
    [openRoleAssignmentModal, openUserGroupModal, reload]
  )
  return (
    <TableV2<UserGroupAggregateDTO>
      className={css.table}
      columns={columns}
      name="UserGroupsListView"
      data={data?.data?.content || []}
      onRowClick={userGroup => {
        history.push(
          routes.toUserGroupDetails({
            accountId,
            orgIdentifier,
            projectIdentifier,
            module,
            userGroupIdentifier: userGroup.userGroupDTO.identifier
          })
        )
      }}
      pagination={{
        itemCount: data?.data?.totalItems || 0,
        pageSize: data?.data?.pageSize || 10,
        pageCount: data?.data?.totalPages || 0,
        pageIndex: data?.data?.pageIndex || 0,
        gotoPage: gotoPage
      }}
    />
  )
}

export default UserGroupsListView
