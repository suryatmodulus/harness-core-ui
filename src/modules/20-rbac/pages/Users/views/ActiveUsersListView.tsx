import React, { useState, useMemo } from 'react'
import { Text, Layout, Button, Popover, Avatar } from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import { Classes, Position, Menu } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import {
  UserAggregate,
  useDeleteActiveUser,
  useGetActiveUsersAggregated,
  UserGroupDTO,
  UserSearchDTO,
  RoleBinding
} from 'services/cd-ng'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/exports'
import { useConfirmationDialog, useToaster, Page } from '@common/exports'
import RoleBindingsList from '@rbac/components/RoleBindingsList/RoleBindingsList'
import { PrincipalType, useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import { useMutateAsGet } from '@common/hooks'
import css from './UserListView.module.scss'

interface ActiveUserListViewProps {
  searchTerm?: string
  openRoleAssignmentModal: (
    type?: PrincipalType,
    principalInfo?: UserGroupDTO | UserSearchDTO,
    roleBindings?: RoleBinding[]
  ) => void
}

const RenderColumnUser: Renderer<CellProps<UserAggregate>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Avatar email={data.user?.email} hoverCard={false} />
      <Text>{data.user?.name}</Text>
    </Layout.Horizontal>
  )
}
const RenderColumnRoleAssignments: Renderer<CellProps<UserAggregate>> = ({ row, column }) => {
  const data = row.original.roleBindings?.map(item => ({
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
        data-testid={`addRole-${row.original.user.uuid}`}
        className={css.roleButton}
        onClick={() =>
          (column as any).openRoleAssignmentModal(PrincipalType.USER, row.original.user, row.original.roleBindings)
        }
      />
    </Layout.Horizontal>
  )
}

const RenderColumnStatus: Renderer<CellProps<UserAggregate>> = () => {
  const { getString } = useStrings()

  return <Text>{getString('active')}</Text>
}
const RenderColumnEmail: Renderer<CellProps<UserAggregate>> = ({ row }) => {
  const data = row.original

  return <Text>{data.user?.email}</Text>
}

const RenderColumnMenu: Renderer<CellProps<UserAggregate>> = ({ row, column }) => {
  const data = row.original.user
  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const { mutate: deleteUser } = useDeleteActiveUser({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { openDialog } = useConfirmationDialog({
    contentText: getString('rbac.usersPage.deleteConfirmation', { name: data?.name }),
    titleText: getString('rbac.usersPage.deleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async didConfirm => {
      if (didConfirm && data) {
        try {
          const deleted = await deleteUser(data.uuid)
          deleted && showSuccess(getString('rbac.usersPage.deleteSuccessMessage', { name: data?.name }))
          ;(column as any).refetchActiveUsers?.()
        } catch (err) {
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    openDialog()
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
          data-testid={`menu-${data.uuid}`}
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

const ActiveUserListView: React.FC<ActiveUserListViewProps> = ({ searchTerm, openRoleAssignmentModal }) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const [page, setPage] = useState(0)

  const { data, loading, error, refetch } = useMutateAsGet(useGetActiveUsersAggregated, {
    body: {},
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pageIndex: page,
      pageSize: 10,
      searchTerm
    }
  })

  const { openRoleAssignmentModal: addRole } = useRoleAssignmentModal({
    onSuccess: refetch
  })

  const columns: Column<UserAggregate>[] = useMemo(
    () => [
      {
        Header: getString('users'),
        id: 'user',
        accessor: row => row.user?.name,
        width: '25%',
        Cell: RenderColumnUser
      },
      {
        Header: getString('rbac.usersPage.roleBinding'),
        id: 'roleBinding',
        accessor: row => row.roleBindings,
        width: '40%',
        Cell: RenderColumnRoleAssignments,
        openRoleAssignmentModal: addRole
      },
      {
        Header: getString('status'),
        id: 'status',
        accessor: row => row.roleBindings?.[0]?.roleIdentifier,
        width: '10%',
        Cell: RenderColumnStatus
      },
      {
        Header: getString('email'),
        id: 'email',
        accessor: row => row.user?.email,
        width: '20%',
        Cell: RenderColumnEmail
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.user?.uuid,
        width: '5%',
        Cell: RenderColumnMenu,
        refetchActiveUsers: refetch,
        disableSortBy: true
      }
    ],
    [openRoleAssignmentModal, refetch]
  )
  return (
    <Page.Body
      loading={loading}
      error={error?.message}
      retryOnError={() => refetch()}
      noData={
        !searchTerm
          ? {
              when: () => !data?.data?.content?.length,
              icon: 'nav-project',
              message: getString('rbac.usersPage.noDataDescription'),
              buttonText: getString('newUser'),
              onClick: () => openRoleAssignmentModal()
            }
          : {
              when: () => !data?.data?.content?.length,
              icon: 'nav-project',
              message: getString('rbac.usersPage.noUsersFound')
            }
      }
    >
      <Table<UserAggregate>
        className={css.table}
        columns={columns}
        data={data?.data?.content || []}
        pagination={{
          itemCount: data?.data?.totalItems || 0,
          pageSize: data?.data?.pageSize || 10,
          pageCount: data?.data?.totalPages || 0,
          pageIndex: data?.data?.pageIndex || 0,
          gotoPage: (pageNumber: number) => setPage(pageNumber)
        }}
      />
    </Page.Body>
  )
}

export default ActiveUserListView
