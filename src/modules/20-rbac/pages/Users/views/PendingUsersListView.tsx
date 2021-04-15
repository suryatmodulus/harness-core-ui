import React, { useState, useMemo, useEffect } from 'react'
import { Text, Layout, Button, Popover, Avatar } from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import { Classes, Position, Menu, Tag } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { Invite, useDeleteInvite, useGetPendingUsersAggregated } from 'services/cd-ng'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/exports'
import { useConfirmationDialog, useToaster, Page } from '@common/exports'
import RoleBindingsList from '@rbac/components/RoleBindingsList/RoleBindingsList'
import { useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import { useMutateAsGet } from '@common/hooks'
import css from './UserListView.module.scss'

interface PendingUserListViewProps {
  searchTerm?: string
  reload?: boolean
}

const RenderColumnUser: Renderer<CellProps<Invite>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Avatar email={data.email} hoverCard={false} />
      <Text>{data.name || data.email.split('@')[0]}</Text>
    </Layout.Horizontal>
  )
}
const RenderColumnRoleAssignments: Renderer<CellProps<Invite>> = ({ row }) => {
  const data = row.original.roleBindings?.map(item => ({
    item: `${item.roleName} - ${item.resourceGroupName}`,
    managed: item.managedRole
  }))

  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <RoleBindingsList data={data} length={2} />
    </Layout.Horizontal>
  )
}

const RenderColumnStatus: Renderer<CellProps<Invite>> = () => {
  const { getString } = useStrings()

  return (
    <Tag round className={css.invitation}>
      {getString('rbac.usersPage.pendingInvitation')}
    </Tag>
  )
}
const RenderColumnEmail: Renderer<CellProps<Invite>> = ({ row }) => {
  const data = row.original

  return <Text>{data.email}</Text>
}

const RenderColumnMenu: Renderer<CellProps<Invite>> = ({ row, column }) => {
  const data = row.original
  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const { mutate: deleteUser } = useDeleteInvite({})

  const { openDialog } = useConfirmationDialog({
    contentText: getString('rbac.usersPage.deleteConfirmation', { name: data?.name }),
    titleText: getString('rbac.usersPage.deleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async didConfirm => {
      if (didConfirm && data) {
        try {
          const deleted = await deleteUser(data.id, { headers: { 'content-type': 'application/json' } })
          deleted && showSuccess(getString('rbac.usersPage.deleteSuccessMessage', { name: data?.name || data?.email }))
          ;(column as any).refetchPendingUsers?.()
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
          data-testid={`menu-${data.id}`}
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

const PendingUserListView: React.FC<PendingUserListViewProps> = ({ searchTerm, reload }) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const [page, setPage] = useState(0)

  const { data, loading, error, refetch } = useMutateAsGet(useGetPendingUsersAggregated, {
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

  const { openRoleAssignmentModal } = useRoleAssignmentModal({
    onSuccess: refetch
  })

  useEffect(() => {
    reload && refetch()
  }, [reload])

  const columns: Column<Invite>[] = useMemo(
    () => [
      {
        Header: getString('users'),
        id: 'user',
        accessor: row => row.name,
        width: '25%',
        Cell: RenderColumnUser
      },
      {
        Header: getString('rbac.usersPage.roleBinding'),
        id: 'roleBinding',
        accessor: row => row.roleBindings,
        width: '30%',
        Cell: RenderColumnRoleAssignments,
        openRoleAssignmentModal: openRoleAssignmentModal
      },
      {
        Header: getString('status'),
        id: 'status',
        accessor: row => row.id,
        width: '20%',
        Cell: RenderColumnStatus
      },
      {
        Header: getString('email'),
        id: 'email',
        accessor: row => row.email,
        width: '20%',
        Cell: RenderColumnEmail
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.approved,
        width: '5%',
        Cell: RenderColumnMenu,
        refetchPendingUsers: refetch,
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
      <Table<Invite>
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

export default PendingUserListView
