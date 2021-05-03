import React, { useEffect, useState } from 'react'
import { get } from 'lodash-es'
import { useParams, useHistory } from 'react-router-dom'
import moment from 'moment'
import type { CellProps, Renderer, Column } from 'react-table'
import { Button, Container, Text, Layout, Popover, Color, FlexExpander } from '@wings-software/uicore'
import { Menu, Classes, Position } from '@blueprintjs/core'
import { PageError } from '@common/components/Page/PageError'
import { useToaster } from '@common/components/Toaster/useToaster'
import { useStrings } from 'framework/strings'
import {
  GetDelegatesStatusV2QueryParams,
  useDeleteDelegate,
  useGetDelegatesStatusV2,
  DelegateInner
} from 'services/portal'
import { useConfirmationDialog } from '@common/exports'
import useCreateDelegateModal from '@delegates/modals/DelegateModal/useCreateDelegateModal'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import Table from '@common/components/Table/Table'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { DelegateStatus } from '@delegates/constants'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'

import css from './DelegatesPage.module.scss'

const POLLING_INTERVAL = 10000

const RenderConnectivityColumn: Renderer<CellProps<DelegateInner>> = ({ row }) => {
  const { getString } = useStrings()
  const delegate = row.original
  const isApprovalRequired = delegate.status === DelegateStatus.WAITING_FOR_APPROVAL
  const isConnected = delegate.connections ? delegate?.connections?.length > 0 : false
  const text = isApprovalRequired
    ? getString('delegate.pendingApproval')
    : isConnected
    ? getString('connected')
    : getString('delegate.notConnected')
  const color: Color = isApprovalRequired ? Color.YELLOW_500 : isConnected ? Color.GREEN_600 : Color.GREY_400

  return (
    <Text icon="full-circle" iconProps={{ size: 6, color }}>
      {text}
    </Text>
  )
}

const RenderIconColumn: Renderer<CellProps<DelegateInner>> = ({ row }) => (
  <Text icon={delegateTypeToIcon(row.original.delegateType as string)} iconProps={{ size: 24 }} />
)

const RenderNameColumn: Renderer<CellProps<DelegateInner>> = ({ row }) => {
  const data = row.values
  return (
    <>
      <Layout.Horizontal spacing="small" data-testid={data.hostName}>
        <Layout.Vertical padding={{ left: 'small' }}>
          <Layout.Horizontal spacing="small" data-testid={data.hostName}>
            <Text color={Color.BLACK}>{data.delegateName || data.name}</Text>
          </Layout.Horizontal>
          <Text color={Color.GREY_400}>{data.name}</Text>
        </Layout.Vertical>
      </Layout.Horizontal>
    </>
  )
}

const RenderTagsColumn: Renderer<CellProps<DelegateInner>> = ({ row }) => {
  if (!row.values.tags || !row.values.tags.length) {
    return null
  }
  return (
    <Container className={css.connectivity}>
      <TagsViewer tags={row.values.tags} />
    </Container>
  )
}

const RenderColumnMenu: Renderer<CellProps<Required<DelegateInner>>> = ({ row, column }) => {
  const data = row.original.uuid
  const { getString } = useStrings()
  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { accountId } = useParams<Record<string, string>>()
  const { mutate: deleteDelegate } = useDeleteDelegate({
    queryParams: { accountId: accountId }
  })
  const { openDialog } = useConfirmationDialog({
    contentText: `${getString('delegate.questionDeleteDelegate')} ${row.original.delegateName}`,
    titleText: getString('delegate.deleteDelegate'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const deleted = await deleteDelegate(data)

          if (deleted) {
            showSuccess(`Delegate ${row.original.delegateName} deleted`)
            ;(column as any).reload?.()
          }
        } catch (error) {
          showError(error.message)
        }
      }
    }
  })
  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    // if (!data?.connector?.identifier) return
    openDialog()
  }

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
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
          <Menu.Item icon="edit" text={getString('details')} />
          <Menu.Item icon="trash" text={getString('delete')} onClick={handleDelete} />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const fullSizeContentStyle: React.CSSProperties = {
  position: 'fixed',
  top: '135px',
  left: '270px',
  width: 'calc(100% - 270px)',
  height: 'calc(100% - 135px)'
}

export const DelegateListing: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, module } = useParams<Record<string, string>>()
  const history = useHistory()
  // TODO: useGetDelegatesStatusV2 current does not support project, but it must in order to filter delegates project
  const queryParams: GetDelegatesStatusV2QueryParams = { accountId, module } as GetDelegatesStatusV2QueryParams
  const { data, loading, error, refetch } = useGetDelegatesStatusV2({ queryParams })
  const { openDelegateModal } = useCreateDelegateModal()
  const delegates = get(data, 'resource.delegates', [])
  const columns: Column<DelegateInner>[] = [
    {
      Header: '',
      width: '30px',
      id: 'icon',
      disableSortBy: true,
      Cell: RenderIconColumn
    },
    {
      Header: getString('delegate.DelegateName').toUpperCase(),
      accessor: (row: DelegateInner) => row.delegateName || row.hostName,
      width: '30%',
      id: 'name',
      Cell: RenderNameColumn
    },
    {
      Header: getString('tagsLabel').toUpperCase(),
      accessor: (row: DelegateInner) => row.tags,
      id: 'tags',
      width: '30%',
      Cell: RenderTagsColumn
    },
    {
      Header: getString('delegate.LastHeartBeat').toUpperCase(),
      accessor: (row: DelegateInner) => moment(row.lastHeartBeat).fromNow(),
      id: 'lastHeartBeat',
      width: 'calc(20% - 10px)'
    },
    {
      Header: getString('connectivityStatus').toUpperCase(),
      accessor: (row: DelegateInner) => row.status,
      id: 'connectivity',
      width: 'calc(15% - 20px)',
      Cell: RenderConnectivityColumn
    },
    {
      Header: '',
      width: '5%',
      accessor: (row: DelegateInner) => row?.uuid,
      disableSortBy: true,
      id: 'action',
      Cell: RenderColumnMenu
    }
  ]

  // Add polling
  useEffect(() => {
    let timeoutId = 0

    if (!loading && !error && data) {
      timeoutId = window.setTimeout(() => {
        refetch()
      }, POLLING_INTERVAL)
    }

    return () => {
      clearTimeout(timeoutId)
    }
  }, [loading, error, data, refetch])

  if (loading && !data) {
    return (
      <Container style={fullSizeContentStyle}>
        <ContainerSpinner />
      </Container>
    )
  }

  if (error) {
    return (
      <Container style={fullSizeContentStyle}>
        <PageError message={error.message} onClick={() => refetch()} />
      </Container>
    )
  }

  return (
    <Container>
      <Layout.Horizontal className={css.header}>
        <Button
          intent="primary"
          text={getString('delegate.NEW_DELEGATE')}
          icon="plus"
          onClick={() => openDelegateModal()}
        />
        <FlexExpander />
        <Layout.Horizontal spacing="xsmall">
          <Button minimal icon="main-search" disabled />
          <Button minimal icon="settings" disabled />
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Page.Body>
        <Table
          columns={columns}
          data={delegates}
          className={css.delegateTable}
          onRowClick={item => {
            history.push(
              routes.toResourcesDelegatesDetails({
                accountId,
                delegateId: item.uuid as string
              })
            )
          }}
        />
      </Page.Body>
    </Container>
  )
}
export default DelegateListing
