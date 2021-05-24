import React from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import { Button, Color, Layout, Popover, Text, SparkChart, Icon } from '@wings-software/uicore'
import { Classes, Menu, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import Table from '@common/components/Table/Table'
import TagsPopover from '@common/components/TagsPopover/TagsPopover'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import { useConfirmationDialog, useToaster } from '@common/exports'
import { useRunPipelineModal } from '@pipeline/components/RunPipelineModal/useRunPipelineModal'
import { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse, useSoftDeletePipeline } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { getIconsForPipeline, getStatusColor } from '../PipelineListUtils'
import css from '../PipelinesPage.module.scss'

interface PipelineListViewProps {
  data?: PagePMSPipelineSummaryResponse
  gotoPage: (pageNumber: number) => void
  goToPipelineDetail: (pipeline?: PMSPipelineSummaryResponse) => void
  goToPipelineStudio: (pipeline?: PMSPipelineSummaryResponse) => void
  refetchPipeline: () => void
}

// Todo: Remove this when BE updated
interface PipelineDTO extends PMSPipelineSummaryResponse {
  admin?: string
  collaborators?: string
  status?: string
}

type CustomColumn<T extends Record<string, any>> = Column<T> & {
  goToPipelineStudio?: (pipeline?: PMSPipelineSummaryResponse) => void
  goToPipelineDetail?: (pipeline?: PMSPipelineSummaryResponse) => void
  refetchPipeline?: () => void
}

const RenderColumnMenu: Renderer<CellProps<PipelineDTO>> = ({ row, column }) => {
  const data = row.original
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { showSuccess, showError } = useToaster()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { mutate: deletePipeline } = useSoftDeletePipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const { getString } = useStrings()

  const { openDialog: confirmDelete } = useConfirmationDialog({
    contentText: getString('pipeline-list.confirmDelete', { name: data.name }),
    titleText: getString('pipeline-list.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */
      if (isConfirmed) {
        try {
          const deleted = await deletePipeline(data.identifier || /* istanbul ignore next */ '', {
            headers: { 'content-type': 'application/json' }
          })
          /* istanbul ignore else */
          if (deleted.status === 'SUCCESS') {
            showSuccess(getString('pipeline-list.pipelineDeleted', { name: data.name }))
          }
          ;(column as any).refetchPipeline()
        } catch (err) {
          /* istanbul ignore next */
          showError(err?.data?.message)
        }
      }
    }
  })

  const [canDelete, canRun] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: data.identifier as string
      },
      permissions: [PermissionIdentifier.DELETE_PIPELINE, PermissionIdentifier.EXECUTE_PIPELINE]
    },
    [data.identifier]
  )

  const runPipeline = useRunPipelineModal({
    pipelineIdentifier: (data.identifier || '') as string,
    repoIdentifier: data.gitDetails?.repoIdentifier,
    branch: data.gitDetails?.branch
  })

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
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
          className={css.actionButton}
          icon="more"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu style={{ minWidth: 'unset' }} onClick={e => e.stopPropagation()}>
          <Menu.Item
            icon="play"
            text={getString('runPipelineText')}
            disabled={!canRun}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              runPipeline()
            }}
          />
          <Menu.Item
            icon="list-detail-view"
            text={getString('viewExecutions')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              ;(column as any).goToPipelineDetail(data)
              setMenuOpen(false)
            }}
          />
          <Menu.Item
            icon="cog"
            text={getString('launchStudio')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              ;(column as any).goToPipelineStudio(data)
              setMenuOpen(false)
            }}
          />
          <Menu.Divider />
          <Menu.Item
            icon="duplicate"
            text={getString('projectCard.clone')}
            disabled
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
            }}
          />
          <Menu.Item
            icon="trash"
            text={getString('delete')}
            disabled={!canDelete}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              confirmDelete()
              setMenuOpen(false)
            }}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const RenderColumnPipeline: Renderer<CellProps<PipelineDTO>> = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="large">
      <span>
        {getIconsForPipeline(data).map(iconObj => (
          <Icon key={iconObj.icon} name={iconObj.icon} size={iconObj.size} padding={{ left: 'xsmall' }} />
        ))}
      </span>
      <div>
        <Layout.Vertical spacing="xsmall" data-testid={data.identifier}>
          <Layout.Horizontal spacing="medium">
            <Text
              color={Color.GREY_800}
              tooltipProps={{ position: Position.BOTTOM }}
              tooltip={
                <Layout.Vertical spacing="medium" padding="medium" style={{ maxWidth: 400 }}>
                  <Text>{getString('nameLabel', { name: data.name })}</Text>
                  <Text>{getString('idLabel', { id: data.identifier })}</Text>
                  <Text>{getString('descriptionLabel', { description: data.description })}</Text>
                </Layout.Vertical>
              }
            >
              {data.name}
            </Text>
            {data.tags && Object.keys(data.tags || {}).length ? <TagsPopover tags={data.tags} /> : null}
          </Layout.Horizontal>
          <Text tooltipProps={{ position: Position.BOTTOM }} color={Color.GREY_400}>
            {getString('idLabel', { id: data.identifier })}
          </Text>
        </Layout.Vertical>
      </div>
    </Layout.Horizontal>
  )
}

const RenderActivity: Renderer<CellProps<PipelineDTO>> = ({ row, column }) => {
  const data = row.original

  const deployments = data.executionSummaryInfo?.deployments?.reduce((acc, val) => acc + val, 0) || 0
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
      <div>
        <Text color={Color.GREY_400} className={`${deployments ? css.clickable : ''}`} font="small" lineClamp={2}>
          {getString('executionsText')}
        </Text>
        <Text
          color={deployments ? Color.PRIMARY_7 : Color.GREY_400}
          className={`${deployments ? css.clickable : ''}`}
          onClick={event => {
            event.stopPropagation()
            ;(column as any).goToPipelineDetail(data)
          }}
          font="small"
          lineClamp={2}
          style={{ maxWidth: 100 }}
        >
          ({getString('lastSevenDays')})
        </Text>
      </div>

      <Text color={Color.GREY_400} font="medium" iconProps={{ size: 18 }}>
        {deployments}
      </Text>

      {deployments ? (
        <span className={css.activityChart}>
          <SparkChart
            data={data.executionSummaryInfo?.deployments || []}
            data2={data.executionSummaryInfo?.numOfErrors || []}
            color={Color.GREEN_500}
            color2={Color.RED_600}
          />
        </span>
      ) : (
        <Text font={{ size: 'xsmall' }}>{getString('emptyDeployments')}</Text>
      )}
    </Layout.Horizontal>
  )
}

export const RenderGitDetails: Renderer<CellProps<PipelineDTO>> = ({ row }) => {
  const { gitDetails } = row.original

  return !!gitDetails?.repoIdentifier && !!gitDetails.branch ? (
    <Layout.Horizontal
      style={{ alignItems: 'center' }}
      padding={{ right: 'medium' }}
      className={css.pipelineGitDetails}
    >
      <Text
        style={{ fontSize: '13px', wordWrap: 'break-word', maxWidth: '100px' }}
        color={Color.GREY_800}
        margin={{ right: 'small' }}
        lineClamp={1}
        title={gitDetails.repoIdentifier}
      >
        {gitDetails.repoIdentifier}
      </Text>
      <Layout.Horizontal
        border={{ color: Color.GREY_200 }}
        spacing="xsmall"
        style={{ borderRadius: '5px', alignItems: 'center' }}
        padding={{ left: 'small', right: 'small', top: 'xsmall', bottom: 'xsmall' }}
        background={Color.GREY_100}
      >
        <Icon name="git-new-branch" size={11} color={Color.GREY_600} />
        <Text
          style={{ wordWrap: 'break-word', maxWidth: '100px' }}
          font={{ size: 'small' }}
          color={Color.GREY_800}
          title={gitDetails.branch}
          lineClamp={1}
        >
          {gitDetails.branch}
        </Text>
      </Layout.Horizontal>
    </Layout.Horizontal>
  ) : (
    <></>
  )
}

const RenderLastRun: Renderer<CellProps<PipelineDTO>> = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="large" style={{ alignItems: 'center' }}>
      <Layout.Horizontal spacing="medium">
        <Text
          rightIcon={data.executionSummaryInfo?.lastExecutionTs ? 'full-circle' : undefined}
          rightIconProps={{ color: getStatusColor(data), size: 8, padding: { left: 'medium' } }}
        >
          {data.executionSummaryInfo?.lastExecutionTs
            ? formatDatetoLocale(data.executionSummaryInfo?.lastExecutionTs)
            : getString('pipelineSteps.pullNeverLabel')}
        </Text>
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

const RenderRunPipeline: Renderer<CellProps<PipelineDTO>> = ({ row }): JSX.Element => {
  const rowdata = row.original
  const runPipeline = useRunPipelineModal({
    pipelineIdentifier: (rowdata.identifier || '') as string,
    repoIdentifier: rowdata.gitDetails?.repoIdentifier,
    branch: rowdata.gitDetails?.branch
  })

  return (
    <RbacButton
      style={{ textAlign: 'end' }}
      intent="primary"
      icon="run-pipeline"
      className={css.runPipelineListBtn}
      permission={{
        resource: {
          resourceType: ResourceType.PIPELINE,
          resourceIdentifier: rowdata.identifier as string
        },
        permission: PermissionIdentifier.EXECUTE_PIPELINE
      }}
      onClick={e => {
        e.stopPropagation()
        runPipeline()
      }}
    />
  )
}

export const PipelineListView: React.FC<PipelineListViewProps> = ({
  data,
  goToPipelineDetail,
  gotoPage,
  refetchPipeline,
  goToPipelineStudio
}): JSX.Element => {
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()
  const columns: CustomColumn<PipelineDTO>[] = React.useMemo(
    () => [
      {
        Header: getString('common.pipeline').toUpperCase(),
        accessor: 'name',
        width: isGitSyncEnabled ? '30%' : '35%',
        Cell: RenderColumnPipeline
      },
      {
        Header: getString('activity').toUpperCase(),
        accessor: 'executionSummaryInfo',
        width: isGitSyncEnabled ? '20%' : '25%',
        Cell: RenderActivity,
        disableSortBy: true,
        goToPipelineDetail
      },
      {
        Header: getString('common.gitSync.repoDetails').toUpperCase(),
        accessor: 'gitDetails',
        width: '20%',
        Cell: RenderGitDetails,
        disableSortBy: true
      },
      {
        Header: getString('lastExecutionTs').toUpperCase(),
        accessor: 'description',
        width: isGitSyncEnabled ? '20%' : '25%',
        Cell: RenderLastRun,
        disableSortBy: true
      },
      {
        Header: getString('runPipelineText').toUpperCase(),
        accessor: 'tags',
        width: isGitSyncEnabled ? '5%' : '10%',
        Cell: RenderRunPipeline,
        disableSortBy: true,
        refetchPipeline,
        goToPipelineStudio
      },
      {
        Header: '',
        accessor: 'version',
        width: '5%',
        Cell: RenderColumnMenu,
        disableSortBy: true,
        refetchPipeline,
        goToPipelineStudio,
        goToPipelineDetail
      }
    ],
    [refetchPipeline, goToPipelineStudio, isGitSyncEnabled]
  )

  if (!isGitSyncEnabled) {
    columns.splice(2, 1)
  }

  return (
    <Table<PipelineDTO>
      className={css.table}
      columns={columns}
      data={data?.content || []}
      onRowClick={item => goToPipelineStudio(item)}
      pagination={{
        itemCount: data?.totalElements || 0,
        pageSize: data?.size || 10,
        pageCount: data?.totalPages || -1,
        pageIndex: data?.number || 0,
        gotoPage
      }}
    />
  )
}
