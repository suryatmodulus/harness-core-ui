import React, { useEffect, useState, useMemo } from 'react'
import { get, set } from 'lodash-es'
import { useParams, useHistory } from 'react-router-dom'
import moment from 'moment'
import type { CellProps, Renderer, Column } from 'react-table'
import {
  Button,
  Container,
  Text,
  Layout,
  Popover,
  Color,
  FlexExpander,
  ExpandingSearchInput
} from '@wings-software/uicore'
import { Menu, MenuItem, Classes, Position, Dialog } from '@blueprintjs/core'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { PageError } from '@common/components/Page/PageError'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components/Toaster/useToaster'
import {
  GetDelegatesStatusV2QueryParams,
  useDeleteDelegateGroup,
  useGetDelegateGroupsV2,
  DelegateGroupDetails,
  DelegateInsightsBarDetails
} from 'services/portal'
import { useConfirmationDialog } from '@common/exports'
import useCreateDelegateModal from '@delegates/modals/DelegateModal/useCreateDelegateModal'
import DelegateInstallationError from '@delegates/components/CreateDelegate/K8sDelegate/DelegateInstallationError/DelegateInstallationError'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import Table from '@common/components/Table/Table'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
//import { DelegateStatus } from '@delegates/constants'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'

import css from './DelegatesPage.module.scss'

const POLLING_INTERVAL = 10000

type cellWithModalControl = {
  cell: CellProps<DelegateGroupDetails>
  setOpenTroubleshoter: (flag: boolean) => void
}

const RenderConnectivityColumn = ({ cell, setOpenTroubleshoter }: cellWithModalControl) => {
  const { getString } = useStrings()
  const { row } = cell
  const delegate = row.original
  //const isApprovalRequired = delegate.status === DelegateStatus.WAITING_FOR_APPROVAL
  const isConnected = delegate.activelyConnected
  const text = /*isApprovalRequired
    ? getString('delegate.pendingApproval')
    :*/ isConnected ? getString('connected') : getString('delegate.notConnected')
  const color: Color = /*isApprovalRequired ? Color.YELLOW_500 :*/ isConnected ? Color.GREEN_600 : Color.GREY_400

  return (
    <Layout.Vertical>
      <Text icon="full-circle" iconProps={{ size: 6, color }}>
        {text}
      </Text>
      {!isConnected && (
        <Text
          color={Color.BLUE_400}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            setOpenTroubleshoter(true)
          }}
        >
          {getString('delegates.troubleshootOption')}
        </Text>
      )}
    </Layout.Vertical>
  )
}

const RenderIconColumn: Renderer<CellProps<DelegateGroupDetails>> = ({ row }) => (
  <Text icon={delegateTypeToIcon(row.original.delegateType as string)} iconProps={{ size: 24 }} />
)

const RenderNameColumn: Renderer<CellProps<DelegateGroupDetails>> = ({ row }) => {
  const { getString } = useStrings()
  const data = row.original
  return (
    <>
      <Layout.Horizontal spacing="small" data-testid={data.groupHostName}>
        <Layout.Vertical padding={{ left: 'small' }}>
          <Layout.Horizontal spacing="small" data-testid={data.groupName}>
            <Text color={Color.BLACK}>
              {data.groupName}
              {getString('delegates.delegateInstances', {
                current: data.delegateInstanceDetails?.length,
                total: data?.sizeDetails?.replicas
              })}
            </Text>
          </Layout.Horizontal>
          <Text color={Color.GREY_400}>{data.groupHostName}</Text>
        </Layout.Vertical>
      </Layout.Horizontal>
    </>
  )
}

const RenderTagsColumn: Renderer<CellProps<DelegateGroupDetails>> = ({ row }) => {
  if (!row.original.groupImplicitSelectors) {
    return null
  }
  return (
    <Container className={css.connectivity}>
      <TagsViewer tags={Object.keys(row.original.groupImplicitSelectors)} />
    </Container>
  )
}

const RenderActivityColumn: Renderer<CellProps<DelegateGroupDetails>> = ({ row }) => {
  const insights = get(row.original, 'delegateInsightsDetails.insights', [])
  if (!insights.length) {
    return null
  }
  let maxHeight = 0

  const sortedInsights = insights.sort((insA: DelegateInsightsBarDetails, insB: DelegateInsightsBarDetails) =>
    (insA?.timeStamp || 0) > (insB?.timeStamp || 0) ? 1 : -1
  )

  sortedInsights.forEach((insight: any) => {
    let maxPerInsight = 0
    insight.counts.forEach((count: any) => {
      maxPerInsight +=
        get(count, 'SUCCESSFUL', 0) +
        get(count, 'FAILED', 0) +
        get(count, 'IN_PROGRESS', 0) +
        get(count, 'PERPETUAL_TASK_ASSIGNED', 0)
    })
    maxHeight = Math.max(maxPerInsight, maxHeight)
  })

  return (
    <Container className={css.activity}>
      {insights.map((insight: any, index: number) => {
        let inProgressCount = 0
        let failedCount = 0
        let successfulCount = 0
        let perpetualCount = 0
        insight.counts.forEach((count: any) => {
          inProgressCount += get(count, 'IN_PROGRESS', 0)
          failedCount += get(count, 'FAILED', 0)
          successfulCount += get(count, 'SUCCESSFUL', 0)
          perpetualCount = get(count, 'PERPETUAL_TASK_ASSIGNED', 0)
        })
        const freeSpace = maxHeight - inProgressCount - failedCount - successfulCount - perpetualCount
        return (
          <div className={css.activityInsight} key={index}>
            <>
              <div style={{ flex: `${freeSpace}` }} key="blockSpace" />
              <div
                key="blockInProgress"
                style={{ flex: `${inProgressCount}` }}
                className={css.activityBlockInProgress}
              />
              <div style={{ flex: `${failedCount}` }} className={css.activityBlockFailed} key="blockFailed" />
              <div key="blockPerpetual" style={{ flex: `${perpetualCount}` }} className={css.activityBlockPerpetual} />
              <div key="blockSuccess" style={{ flex: `${successfulCount}` }} className={css.activityBlockSuccessful} />
            </>
          </div>
        )
      })}
    </Container>
  )
}

const RenderColumnMenu = ({ cell, setOpenTroubleshoter }: cellWithModalControl) => {
  const { row } = cell
  const groupId = row.original.groupId
  const { getString } = useStrings()
  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { mutate: deleteDelegate } = useDeleteDelegateGroup({
    queryParams: { accountId: accountId }
  })
  const { mutate: forceDeleteDelegate } = useDeleteDelegateGroup({
    queryParams: { accountId: accountId, forceDelete: true }
  })
  const { openDialog } = useConfirmationDialog({
    contentText: getString('delegates.questionDeleteDelegate', { name: row.original.groupName }),
    titleText: getString('delegate.deleteDelegate'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          if (groupId) {
            const deleted = await deleteDelegate(groupId)
            if (deleted) {
              showSuccess(getString('delegates.delegateDeleted', { name: row.original.groupName }))
            }
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
    openDialog()
  }

  const forceDeleteDialog = useConfirmationDialog({
    contentText: `${getString('delegates.questionForceDeleteDelegate')} ${row.original.groupName}`,
    titleText: getString('delegate.deleteDelegate'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          if (groupId) {
            const deleted = await forceDeleteDelegate(groupId)

            if (deleted) {
              showSuccess(getString('delegates.delegateForceDeleted', { name: row.original.groupName }))
            }
          }
        } catch (error) {
          showError(error.message)
        }
      }
    }
  })

  const handleForceDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    forceDeleteDialog.openDialog()
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
          <RbacMenuItem
            permission={{
              resourceScope: {
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              },
              resource: {
                resourceType: ResourceType.DELEGATE,
                resourceIdentifier: row.original.groupId
              },
              permission: PermissionIdentifier.VIEW_DELEGATE
            }}
            icon="edit"
            text={getString('details')}
          />
          <RbacMenuItem
            permission={{
              resourceScope: {
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              },
              resource: {
                resourceType: ResourceType.DELEGATE,
                resourceIdentifier: row.original.groupId
              },
              permission: PermissionIdentifier.DELETE_DELEGATE
            }}
            icon="trash"
            text={getString('delete')}
            onClick={handleDelete}
          />
          <RbacMenuItem
            permission={{
              resourceScope: {
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              },
              resource: {
                resourceType: ResourceType.DELEGATE,
                resourceIdentifier: groupId
              },
              permission: PermissionIdentifier.DELETE_DELEGATE
            }}
            icon="trash"
            text={getString('delegates.forceDelete')}
            onClick={handleForceDelete}
          />
          <MenuItem
            text={getString('delegates.openTroubleshooter')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              setOpenTroubleshoter(true)
            }}
            icon="book"
          />
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
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<Record<string, string>>()
  const [searchParam, setSearchParam] = useState('')
  const [troubleshoterOpen, setOpenTroubleshoter] = useState(false)
  const { DELEGATE_INSIGHTS_ENABLED } = useFeatureFlags()
  const history = useHistory()

  const queryParams: GetDelegatesStatusV2QueryParams = {
    accountId,
    orgId: orgIdentifier,
    projectId: projectIdentifier,
    module
  } as GetDelegatesStatusV2QueryParams
  const { data, loading, error, refetch } = useGetDelegateGroupsV2({ queryParams })
  const { openDelegateModal } = useCreateDelegateModal()
  const delegates = get(data, 'resource.delegateGroupDetails', [])
  const filteredDelegates = searchParam
    ? delegates.filter((delegate: DelegateGroupDetails) => delegate.groupName?.includes(searchParam))
    : delegates

  const [canAccessDelegate] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.DELEGATE
      },
      permissions: [PermissionIdentifier.VIEW_DELEGATE]
    },
    []
  )

  const groupDelegates: DelegateGroupDetails[] = []

  filteredDelegates.forEach((delegateGroup: DelegateGroupDetails) => {
    const delegateName = `${get(delegateGroup, 'groupName', '')} ${getString('delegate.instancesCount', {
      count: delegateGroup?.delegateInstanceDetails?.length,
      total: ''
    })}`
    set(delegateGroup, 'delegateName', delegateName)
    groupDelegates.push(delegateGroup)
  })

  const columns: Column<DelegateGroupDetails>[] = useMemo(() => {
    const tableColumns = [
      {
        Header: '',
        width: '30px',
        id: 'icon',
        disableSortBy: true,
        Cell: RenderIconColumn
      },
      {
        Header: getString('delegate.DelegateName').toUpperCase(),
        accessor: (row: DelegateGroupDetails) => row.groupName,
        width: DELEGATE_INSIGHTS_ENABLED ? '25%' : '30%',
        id: 'name',
        Cell: RenderNameColumn
      },
      {
        Header: getString('tagsLabel').toUpperCase(),
        accessor: (row: DelegateGroupDetails) => row.groupImplicitSelectors,
        id: 'tags',
        width: DELEGATE_INSIGHTS_ENABLED ? '25%' : '30%',
        Cell: RenderTagsColumn
      },
      {
        Header: getString('delegate.LastHeartBeat').toUpperCase(),
        accessor: (row: DelegateGroupDetails) =>
          row.lastHeartBeat ? moment(row.lastHeartBeat).fromNow() : getString('na'),
        id: 'lastHeartBeat',
        width: DELEGATE_INSIGHTS_ENABLED ? 'calc(15% - 10px)' : 'calc(20% - 10px)'
      },
      {
        Header: getString('connectivityStatus').toUpperCase(),
        accessor: (row: DelegateGroupDetails) => row.activelyConnected,
        id: 'connectivity',
        width: 'calc(15% - 20px)',
        Cell: (cell: CellProps<DelegateGroupDetails>) => RenderConnectivityColumn({ cell, setOpenTroubleshoter })
      },
      {
        Header: '',
        width: '5%',
        accessor: (row: DelegateGroupDetails) => row,
        disableSortBy: true,
        id: 'action',
        Cell: (cell: CellProps<DelegateGroupDetails>) => RenderColumnMenu({ cell, setOpenTroubleshoter })
      }
    ]
    if (DELEGATE_INSIGHTS_ENABLED) {
      const activityColumn = {
        Header: getString('activity').toUpperCase(),
        width: 'calc(15% - 10px)',
        id: 'insights',
        disableSortBy: true,
        Cell: RenderActivityColumn
      }
      tableColumns.splice(3, 0, activityColumn)
    }
    return tableColumns
  }, [DELEGATE_INSIGHTS_ENABLED, getString])

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

  const onDelegateClick = (item: DelegateGroupDetails): void => {
    if (canAccessDelegate) {
      const params = {
        accountId,
        delegateId: item.groupId as string
      }
      if (orgIdentifier) {
        set(params, 'orgIdentifier', orgIdentifier)
      }
      if (projectIdentifier) {
        set(params, 'projectIdentifier', projectIdentifier)
      }
      history.push(routes.toDelegatesDetails(params))
    }
  }

  const permissionRequestNewDelegate = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    permission: PermissionIdentifier.UPDATE_DELEGATE,
    resource: {
      resourceType: ResourceType.DELEGATE
    }
  }

  return (
    <Container>
      <Dialog
        isOpen={troubleshoterOpen}
        enforceFocus={false}
        style={{ width: '680px', height: '100%' }}
        onClose={() => setOpenTroubleshoter(false)}
      >
        <DelegateInstallationError />
      </Dialog>
      <Layout.Horizontal className={css.header}>
        <RbacButton
          intent="primary"
          text={getString('delegate.DelegateName')}
          icon="plus"
          permission={permissionRequestNewDelegate}
          onClick={() => openDelegateModal()}
          id="newDelegateBtn"
          data-test="newDelegateButton"
        />
        <FlexExpander />
        <Layout.Horizontal spacing="xsmall">
          <ExpandingSearchInput
            placeholder={getString('delegates.searchDelegateName')}
            throttle={200}
            onChange={text => {
              setSearchParam(text.trim())
            }}
            className={css.search}
          />
          <Button minimal icon="settings" disabled />
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Page.Body>
        <Table columns={columns} data={filteredDelegates} className={css.delegateTable} onRowClick={onDelegateClick} />
      </Page.Body>
    </Container>
  )
}
export default DelegateListing
