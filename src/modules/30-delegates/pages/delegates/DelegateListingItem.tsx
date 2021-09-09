import React, { useState } from 'react'
import ReactTimeago from 'react-timeago'
import { get, set } from 'lodash-es'
import { useParams, useHistory } from 'react-router-dom'
import { Button, Container, Text, Layout, Popover, Color, Card } from '@wings-software/uicore'
import { Menu, MenuItem, Classes, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components/Toaster/useToaster'
import { useDeleteDelegateGroupByIdentifier, DelegateGroupDetails, DelegateInsightsBarDetails } from 'services/portal'
import { useConfirmationDialog } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'

import css from './DelegatesPage.module.scss'

type delTroubleshoterProps = {
  delegate: DelegateGroupDetails
  setOpenTroubleshoter: (flag: boolean) => void
}

export const DelegateListingHeader = () => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal className={css.delegateListHeader}>
      <div key="icon" style={{ width: '30px' }}></div>
      <div key="del-name" style={{ width: '25%' }}>
        {getString('delegate.DelegateName')}
      </div>
      <div key="tags" style={{ width: '25%' }}>
        {getString('tagsLabel')}
      </div>
      <div key="activity" style={{ width: 'calc(15% - 8px)' }}>
        {getString('activity')}
      </div>
      <div key="heartbeat" style={{ width: 'calc(15% - 8px)' }}>
        {getString('delegate.LastHeartBeat')}
      </div>
      <div key="status" style={{ width: 'calc(15% - 14px)' }}>
        {getString('connectivityStatus')}
      </div>
      <div key="actions" style={{ width: '5%' }} />
    </Layout.Horizontal>
  )
}

const RenderActivityColumn = (delegate: DelegateGroupDetails) => {
  const insights = get(delegate, 'delegateInsightsDetails.insights', [])
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

const RenderColumnMenu = ({ delegate, setOpenTroubleshoter }: delTroubleshoterProps) => {
  const { delegateGroupIdentifier, groupName } = delegate
  const { getString } = useStrings()
  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()

  const { mutate: forceDeleteDelegate } = useDeleteDelegateGroupByIdentifier({
    queryParams: { accountId: accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const forceDeleteDialog = useConfirmationDialog({
    contentText: `${getString('delegates.questionForceDeleteDelegate')} ${groupName}`,
    titleText: getString('delegate.deleteDelegate'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          if (delegateGroupIdentifier) {
            const deleted = await forceDeleteDelegate(delegateGroupIdentifier)

            if (deleted) {
              showSuccess(getString('delegates.delegateDeleted', { name: groupName }))
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
                resourceIdentifier: delegateGroupIdentifier
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
                resourceIdentifier: delegateGroupIdentifier
              },
              permission: PermissionIdentifier.DELETE_DELEGATE
            }}
            icon="trash"
            text={getString('delete')}
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

export const DelegateListingItem = ({ delegate, setOpenTroubleshoter }: delTroubleshoterProps) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<Record<string, string>>()
  const history = useHistory()

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

  const onDelegateClick = (): void => {
    if (canAccessDelegate) {
      const params = {
        accountId,
        delegateIdentifier: delegate.delegateGroupIdentifier as string
      }
      if (orgIdentifier) {
        set(params, 'orgIdentifier', orgIdentifier)
      }
      if (projectIdentifier) {
        set(params, 'projectIdentifier', projectIdentifier)
      }
      if (module) {
        set(params, 'module', module)
      }
      history.push(routes.toDelegatesDetails(params))
    }
  }

  const isConnected = delegate.activelyConnected
  const text = isConnected ? getString('connected') : getString('delegate.notConnected')
  const color: Color = isConnected ? Color.GREEN_600 : Color.GREY_400

  return (
    <Card elevation={2} interactive={true} onClick={onDelegateClick} className={css.delegateItemContainer}>
      <Layout.Horizontal className={css.delegateItemSubcontainer}>
        <Text width="30px" icon={delegateTypeToIcon(delegate.delegateType as string)} iconProps={{ size: 24 }} />
        <Layout.Horizontal width="25%" data-testid={delegate.groupHostName}>
          <Layout.Vertical padding={{ left: 'small' }}>
            <Layout.Horizontal spacing="small" data-testid={delegate.groupName}>
              <Text color={Color.BLACK}>
                {delegate.groupName}
                {getString('delegates.delegateInstances', {
                  current: delegate.delegateInstanceDetails?.length,
                  total: delegate?.sizeDetails?.replicas
                })}
              </Text>
            </Layout.Horizontal>
            <Text color={Color.GREY_400}>{delegate.groupHostName}</Text>
          </Layout.Vertical>
        </Layout.Horizontal>

        <Container className={css.connectivity} width="25%">
          {delegate.groupImplicitSelectors && <TagsViewer tags={Object.keys(delegate.groupImplicitSelectors)} />}
        </Container>

        <Layout.Horizontal width="calc(15% - 8px)">{RenderActivityColumn(delegate)}</Layout.Horizontal>

        <Layout.Horizontal width="calc(15% - 8px)">
          {delegate.lastHeartBeat ? <ReactTimeago date={delegate.lastHeartBeat} live /> : getString('na')}
        </Layout.Horizontal>

        <Layout.Vertical width="calc(15% - 14px)">
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

        <Layout.Vertical width="5%">{RenderColumnMenu({ delegate, setOpenTroubleshoter })}</Layout.Vertical>
      </Layout.Horizontal>
    </Card>
  )
}
export default DelegateListingItem
