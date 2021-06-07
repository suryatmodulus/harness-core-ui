import React, { useState, useMemo } from 'react'
import { Text, Layout, Button, Popover, Color } from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import { Classes, Position, Menu, Intent } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import {
  UserGroupAggregateDTO,
  useDeleteUserGroup,
  ResponsePageUserGroupAggregateDTO,
  UserGroupDTO,
  UserMetadataDTO,
  RoleAssignmentMetadataDTO
} from 'services/cd-ng'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/strings'
import { useConfirmationDialog, useToaster } from '@common/exports'
import RoleBindingsList from '@rbac/components/RoleBindingsList/RoleBindingsList'
import { PrincipalType } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import ManagePrincipalButton from '@rbac/components/ManagePrincipalButton/ManagePrincipalButton'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import RbacAvatarGroup from '@rbac/components/RbacAvatarGroup/RbacAvatarGroup'
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

const RenderColumnUserGroup: Renderer<CellProps<UserGroupAggregateDTO>> = ({ row }) => {
  const { getString } = useStrings()
  const data = row.original.userGroupDTO
  return (
    <Layout.Vertical>
      <Text>{data.name}</Text>
      {data.ssoLinked ? (
        <Layout.Horizontal
          flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
          spacing="xsmall"
          className={css.truncatedText}
        >
          <Text icon={'link'} iconProps={{ color: Color.BLUE_500, size: 10 }} color={Color.BLACK}>
            {getString('rbac.userDetails.linkToSSOProviderModal.saml')}
          </Text>
          <Text lineClamp={1} width={110}>
            {data.linkedSsoDisplayName}
          </Text>
          <Text color={Color.BLACK}>{getString('rbac.userDetails.linkToSSOProviderModal.group')}</Text>
          <Text lineClamp={1} width={110}>
            {data.ssoGroupName}
          </Text>
        </Layout.Horizontal>
      ) : null}
    </Layout.Vertical>
  )
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
        minimal
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
  const data = row.original.roleAssignmentsMetadataDTO?.map(item => ({
    item: `${item.roleName} - ${item.resourceGroupName}`,
    managed: item.managedRole
  }))
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <RoleBindingsList data={data} length={2} />
      <ManagePrincipalButton
        text={getString('common.plusNumber', { number: getString('common.role') })}
        minimal
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
    intent: Intent.WARNING,
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
          <RbacMenuItem icon="edit" text={getString('edit')} onClick={handleEdit} permission={permissionRequest} />
          <RbacMenuItem icon="trash" text={getString('delete')} onClick={handleDelete} permission={permissionRequest} />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const UserGroupsListView: React.FC<UserGroupsListViewProps> = props => {
  const { data, gotoPage, reload, openRoleAssignmentModal, openUserGroupModal } = props
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
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
        Header: getString('rbac.roleBinding'),
        id: 'roleBindings',
        accessor: row => row.roleAssignmentsMetadataDTO,
        width: '35%',
        Cell: RenderColumnRoleAssignments,
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
    <Table<UserGroupAggregateDTO>
      className={css.table}
      columns={columns}
      data={data?.data?.content || []}
      // TODO: enable when page is ready
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
