/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { TableV2, Button, Layout, Popover, ButtonVariation, Icon } from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import ReactTimeago from 'react-timeago'
import { Menu, MenuItem, Classes, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { DelegateTokenDetails } from 'services/portal'

import { useRevokeTokenModal } from './modals/useRevokeTokenModal'
import { useMoreTokenInfoModalModal } from './modals/useMoreTokenInfoModal'

import css from './DelegateTokens.module.scss'

interface TokensListViewProps {
  onRevokeSuccess?: () => void
  delegateTokens: DelegateTokenDetails[]
  reload?: () => Promise<void>
  gotoPage?: any
}

type CustomColumn<T extends Record<string, any>> = Column<T> & {
  reload?: () => Promise<void>
}

const DelegateTokensList: React.FC<TokensListViewProps> = props => {
  const { delegateTokens, reload, onRevokeSuccess } = props
  const { getString } = useStrings()

  const { openRevokeTokenModal } = useRevokeTokenModal({ onSuccess: onRevokeSuccess })
  const { openMoreTokenInfoModal } = useMoreTokenInfoModalModal({})

  const RenderColumnName: Renderer<CellProps<DelegateTokenDetails>> = ({ row }) => (
    <span className={`${css.tokenNameColumn} ${css.tokenCellText}`}>
      <Icon name="key" size={28} margin={{ right: 'small' }} />
      {row.original.name}
    </span>
  )
  const RenderColumnCreatedAt: Renderer<CellProps<DelegateTokenDetails>> = ({ row }) => (
    <span className={css.tokenCellText}>
      {row.original.createdAt && <ReactTimeago date={row.original.createdAt} />}
    </span>
  )
  const RenderColumnCreatedBy: Renderer<CellProps<DelegateTokenDetails>> = ({ row }) => (
    <span className={css.tokenCellText}>
      {row.original.createdBy
        ? row.original.createdBy?.name?.toLowerCase()
        : getString('delegates.tokens.createdBySystem')}
    </span>
  )
  const RenderColumnStatus: Renderer<CellProps<DelegateTokenDetails>> = ({ row }) => (
    <span className={css.tokenCellText}>
      {row.original.status === 'ACTIVE' ? getString('active') : getString('delegates.tokens.revoked')}
    </span>
  )
  const RenderColumnActions: Renderer<CellProps<DelegateTokenDetails>> = ({ row }) => (
    <span className={css.tokenCellText}>
      {row.original.status !== 'REVOKED' && (
        <Button
          variation={ButtonVariation.SECONDARY}
          onClick={e => {
            e.stopPropagation()
            openRevokeTokenModal(row.original.name || '')
          }}
        >
          {getString('delegates.tokens.revoke')}
        </Button>
      )}
    </span>
  )
  const RenderColumnMenu: Renderer<CellProps<DelegateTokenDetails>> = ({ row }) => {
    const [menuOpen, setMenuOpen] = useState(false)
    return (
      <Layout.Horizontal className={css.menuColumn}>
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
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(true)
            }}
          />
          <Menu style={{ minWidth: 'unset' }}>
            <MenuItem
              icon="edit"
              text={getString('delegates.tokens.moreInfo')}
              onClick={() => openMoreTokenInfoModal(row.original.name || '')}
            />
          </Menu>
        </Popover>
      </Layout.Horizontal>
    )
  }

  const columns: CustomColumn<DelegateTokenDetails>[] = useMemo(
    () => [
      {
        Header: getString('name').toUpperCase(),
        accessor: 'name',
        id: 'name',
        width: '33%',
        Cell: RenderColumnName
      },
      {
        Header: getString('createdAt').toUpperCase(),
        accessor: 'createdAt',
        id: 'createdAt',
        width: '20%',
        Cell: RenderColumnCreatedAt
      },
      {
        Header: getString('createdBy').toUpperCase(),
        accessor: 'createdBy',
        id: 'createdBy',
        width: '20%',
        Cell: RenderColumnCreatedBy
      },
      {
        Header: getString('status').toUpperCase(),
        accessor: 'status',
        id: 'activity',
        width: '15%',
        Cell: RenderColumnStatus
      },
      {
        Header: '',
        width: '10%',
        id: 'actions',
        Cell: RenderColumnActions,
        reload: reload,
        disableSortBy: true
      },
      {
        Header: '',
        width: '3%',
        id: 'menu',
        Cell: RenderColumnMenu,
        reload: reload,
        disableSortBy: true
      }
    ],
    []
  )

  return (
    <TableV2<DelegateTokenDetails>
      sortable={true}
      className={css.table}
      columns={columns}
      data={delegateTokens}
      name="TokensListView"
      onRowClick={({ name }) => {
        openMoreTokenInfoModal(name || '')
      }}
    />
  )
}

export default DelegateTokensList
