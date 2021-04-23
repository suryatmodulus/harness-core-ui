import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { CellProps, Column, Renderer } from 'react-table'
import { Layout, Button, Text, Avatar, Popover, Container } from '@wings-software/uicore'
import { Classes, Menu, Position } from '@blueprintjs/core'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useRemoveMember, UserGroupDTO, UserSearchDTO } from 'services/cd-ng'
import { Table, useToaster } from '@common/components'
import { useConfirmationDialog } from '@common/exports'
import { useStrings } from 'framework/strings'
import css from '../UserGroupDetails.module.scss'

interface MemberListProps {
  userGroup: UserGroupDTO
  users?: UserSearchDTO[]
  refetch: () => void
  openUserGroupModal: (userGroup?: UserGroupDTO, _isAddMember?: boolean) => void
}

const RenderColumnUser: Renderer<CellProps<UserSearchDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Avatar email={data.email} hoverCard={false} />
      <Text>{data.name}</Text>
    </Layout.Horizontal>
  )
}

const RenderColumnEmail: Renderer<CellProps<UserSearchDTO>> = ({ row }) => {
  const data = row.original

  return <Text>{data.email}</Text>
}

const RenderColumnMenu: Renderer<CellProps<UserSearchDTO>> = ({ row, column }) => {
  const data = row.original
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const { mutate: deleteUser } = useRemoveMember({
    identifier: data.uuid,
    pathParams: {
      identifier: (column as any).userGroupIdentifier
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { openDialog } = useConfirmationDialog({
    contentText: getString('rbac.userGroupPage.userList.deleteConfirmation', { name: data.name }),
    titleText: getString('rbac.userGroupPage.userList.deleteTitle'),
    confirmButtonText: getString('common.remove'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async didConfirm => {
      /* istanbul ignore else */ if (didConfirm && data) {
        try {
          const deleted = await deleteUser(data.uuid, {
            headers: { 'content-type': 'application/json' }
          })
          /* istanbul ignore else */ if (deleted) {
            showSuccess(
              getString('rbac.userGroupPage.userList.deleteSuccessMessage', {
                name: data.name
              })
            )
            ;(column as any).refetchMembers?.()
          } else {
            /* istanbul ignore next */
            showSuccess(
              getString('rbac.userGroupPage.userList.deleteFailureMessage', {
                name: data.name
              })
            )
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
          <Menu.Item icon="trash" text={getString('common.remove')} onClick={handleDelete} />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const MemberList: React.FC<MemberListProps> = ({ users, refetch, userGroup, openUserGroupModal }) => {
  const { getString } = useStrings()
  const { identifier: userGroupIdentifier } = userGroup

  const columns: Column<UserSearchDTO>[] = useMemo(
    () => [
      {
        Header: getString('users'),
        id: 'user',
        accessor: row => row.name,
        width: '45%',
        Cell: RenderColumnUser
      },
      {
        Header: getString('email'),
        id: 'email',
        accessor: row => row.email,
        width: '50%',
        Cell: RenderColumnEmail
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.uuid,
        width: '5%',
        Cell: RenderColumnMenu,
        refetchMembers: refetch,
        userGroupIdentifier: userGroupIdentifier,
        disableSortBy: true
      }
    ],
    [refetch]
  )
  return (
    <Container className={css.memberList}>
      {users?.length ? <Table<UserSearchDTO> data={users} columns={columns} hideHeaders={true} /> : null}
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Button
          text={getString('common.plusNumber', { number: getString('members') })}
          minimal
          className={css.addButton}
          onClick={() => {
            openUserGroupModal(userGroup, true)
          }}
        />
      </Layout.Horizontal>
    </Container>
  )
}

export default MemberList
