import React, { useState, useMemo } from 'react'
import { Text, Layout, Button, Popover, AvatarGroup } from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import { Classes, Position, Menu, Intent } from '@blueprintjs/core'
import { useParams, useHistory } from 'react-router-dom'
import {
  UserGroupAggregateDTO,
  useDeleteUserGroup,
  ResponsePageUserGroupAggregateDTO,
  UserGroupDTO,
  UserSearchDTO,
  RoleBinding
} from 'services/cd-ng'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/exports'
import { useConfirmationDialog, useToaster } from '@common/exports'
import RoleBindingsList from '@rbac/components/RoleBindingsList/RoleBindingsList'
import { PrincipalType } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import routes from '@common/RouteDefinitions'
import css from './UserGroupsListView.module.scss'

interface UserGroupsListViewProps {
  data: ResponsePageUserGroupAggregateDTO | null
  gotoPage: (index: number) => void
  reload: () => Promise<void>
  openRoleAssignmentModal: (
    type?: PrincipalType,
    principalInfo?: UserGroupDTO | UserSearchDTO,
    roleBindings?: RoleBinding[]
  ) => void
}

const RenderColumnUserGroup: Renderer<CellProps<UserGroupAggregateDTO>> = ({ row }) => {
  const data = row.original.userGroupDTO
  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Text>{data.name}</Text>
    </Layout.Horizontal>
  )
}

const RenderColumnMembers: Renderer<CellProps<UserGroupAggregateDTO>> = ({ row }) => {
  const data = row.original
  const avatars =
    data.users?.map(user => {
      return { email: user.email, name: user.name }
    }) || []

  return <AvatarGroup avatars={avatars} restrictLengthTo={6} />
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
      <Button
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
      />
    </Layout.Horizontal>
  )
}

const RenderColumnMenu: Renderer<CellProps<UserGroupAggregateDTO>> = ({ row, column }) => {
  const data = row.original.userGroupDTO
  const [menuOpen, setMenuOpen] = useState(false)
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const { mutate: deleteUserGroup } = useDeleteUserGroup({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const { openDialog: openDeleteDialog } = useConfirmationDialog({
    contentText: getString('rbac.userGroupPage.confirmDelete', { name: data.name }),
    titleText: getString('rbac.userGroupPage.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const deleted = await deleteUserGroup(data.identifier || '', {
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
          <Menu.Item icon="trash" text={getString('delete')} onClick={handleDelete} />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const UserGroupsListView: React.FC<UserGroupsListViewProps> = props => {
  const { data, gotoPage, reload, openRoleAssignmentModal } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
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
        disableSortBy: true
      }
    ],
    [reload]
  )
  return (
    <Table<UserGroupAggregateDTO>
      className={css.table}
      columns={columns}
      data={data?.data?.content || []}
      onRowClick={userGroup => {
        history.push(
          routes.toUserGroupDetails({
            accountId,
            orgIdentifier,
            projectIdentifier,
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
