/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { CellProps, Column, Renderer } from 'react-table'
import {
  Color,
  Layout,
  Text,
  Button,
  Container,
  PageError,
  TableV2,
  Intent,
  useConfirmationDialog,
  FontVariation
} from '@wings-software/uicore'
import { Classes, Menu, Popover, Position, PopoverInteractionKind } from '@blueprintjs/core'
import { useToaster } from '@common/components'
import { useMutateAsGet } from '@common/hooks'
import type { PipelineType, ProjectPathProps, UserPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetBatchUserGroupList, useRemoveMember, UserGroupDTO } from 'services/cd-ng'
import css from '@rbac/pages/UserDetails/UserDetails.module.scss'

const RenderColumnDetails: Renderer<CellProps<UserGroupDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small" className={css.name}>
      <Text color={Color.BLACK} lineClamp={1}>
        {data.name}
      </Text>
    </Layout.Horizontal>
  )
}

const ResourceGroupColumnMenu: Renderer<CellProps<UserGroupDTO>> = ({ row, column }) => {
  const data = row.original
  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { mutate: deleteUserGroup } = useRemoveMember({
    identifier: (column as any).userIdentifier,
    pathParams: {
      identifier: data.identifier || ''
    },
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier }
  })

  const { openDialog } = useConfirmationDialog({
    contentText: `${getString('rbac.userDetails.userGroup.confirmDeleteText', { name: data.name })}`,
    titleText: getString('rbac.userDetails.userGroup.deleteTitle'),
    confirmButtonText: getString('common.remove'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const deleted = await deleteUserGroup((column as any).userIdentifier, {
            headers: { 'content-type': 'application/json' }
          })
          if (deleted)
            showSuccess(
              getString('rbac.userDetails.userGroup.deleteSuccessMessage', {
                name: data.name
              })
            )
          ;(column as any).reload?.()
        } catch (err) {
          showError(err.data?.message || err.message)
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
    <Popover
      isOpen={menuOpen}
      onInteraction={nextOpenState => {
        setMenuOpen(nextOpenState)
      }}
      className={Classes.DARK}
      position={Position.RIGHT_TOP}
    >
      <Button
        minimal
        icon="Options"
        data-testid={`menu-UserGroup-${data.name}`}
        onClick={e => {
          e.stopPropagation()
          setMenuOpen(true)
        }}
      />
      <Menu>
        {data.externallyManaged ? (
          <Popover
            position={Position.TOP}
            fill
            usePortal
            inheritDarkTheme={false}
            interactionKind={PopoverInteractionKind.HOVER}
            hoverCloseDelay={50}
            content={
              <div className={css.popover}>
                <Text font={{ variation: FontVariation.SMALL }}>{getString('rbac.unableToEditSCIMMembership')}</Text>
              </div>
            }
          >
            <div
              onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
                event.stopPropagation()
              }}
            >
              <Menu.Item icon="trash" text={getString('common.remove')} onClick={handleDelete} disabled />
            </div>
          </Popover>
        ) : (
          <Menu.Item icon="trash" text={getString('common.remove')} onClick={handleDelete} />
        )}
      </Menu>
    </Popover>
  )
}

const UserGroupTable: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier, userIdentifier } =
    useParams<PipelineType<ProjectPathProps & UserPathProps>>()
  const { getString } = useStrings()
  const {
    data: userGroupData,
    loading,
    error,
    refetch
  } = useMutateAsGet(useGetBatchUserGroupList, {
    body: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      userIdentifierFilter: [userIdentifier]
    }
  })
  const columns: Column<UserGroupDTO>[] = useMemo(
    () => [
      {
        Header: '',
        accessor: row => row.name,
        id: 'name',
        width: '95%',
        disableSortBy: true,
        Cell: RenderColumnDetails
      },
      {
        Header: '',
        accessor: row => row.identifier,
        width: '5%',
        id: 'action',
        Cell: ResourceGroupColumnMenu,
        disableSortBy: true,
        reload: refetch,
        userIdentifier
      }
    ],
    []
  )

  return (
    <Container margin={{ bottom: 'medium' }}>
      <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }} padding={{ bottom: 'medium' }}>
        {getString('common.userGroups')}
      </Text>
      {loading ? (
        <Text color={Color.GREY_600}>{getString('common.loading')}</Text>
      ) : userGroupData?.data?.length ? (
        <TableV2<UserGroupDTO> hideHeaders={true} data={userGroupData.data} columns={columns} />
      ) : userGroupData?.data ? (
        <Text color={Color.GREY_600}>{getString('rbac.userGroupPage.noUserGroups')}</Text>
      ) : (
        <PageError message={(error?.data as Error)?.message || error?.message} onClick={() => refetch()} />
      )}
      {/* ENABLE WHEN READY */}
      {/* <Layout.Horizontal>
        <Button minimal text={getString('rbac.userDetails.userGroup.addToGroup')} intent="primary" />
      </Layout.Horizontal> */}
    </Container>
  )
}

export default UserGroupTable
