import React from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import { Button, Color, Layout, Popover, Text, SparkChart, Icon } from '@wings-software/uicore'
import { Classes, Menu, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import Table from '@common/components/Table/Table'
import TagsPopover from '@common/components/TagsPopover/TagsPopover'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import { useConfirmationDialog, useToaster } from '@common/exports'
import { RunPipelineModal } from '@pipeline/components/RunPipelineModal/RunPipelineModal'
import { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse, useSoftDeletePipeline } from 'services/pipeline-ng'
import { useStrings } from 'framework/exports'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { getIconsForPipeline, getStatusColor } from '../PipelineListUtils'
import css from '../PipelinesPage.module.scss'

interface PipelineListViewProps {
  data?: PagePMSPipelineSummaryResponse
  gotoPage: (pageNumber: number) => void
  goToPipelineDetail: (pipelineIdentifier?: string) => void
  goToPipelineStudio: (pipelineIdentifier?: string) => void
  refetchPipeline: () => void
}

// Todo: Remove this when BE updated
interface PipelineDTO extends PMSPipelineSummaryResponse {
  admin?: string
  collaborators?: string
  status?: string
}

type CustomColumn<T extends object> = Column<T> & {
  goToPipelineStudio?: (pipelineIdentifier?: string) => void
  goToPipelineDetail?: (pipelineIdentifier?: string) => void
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
          <RunPipelineModal pipelineIdentifier={data.identifier || /* istanbul ignore next */ ''}>
            <Menu.Item icon="play" text={getString('runPipelineText')} disabled={!canRun} />
          </RunPipelineModal>
          <Menu.Item
            icon="list-detail-view"
            text={getString('viewExecutions')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              ;(column as any).goToPipelineDetail(data.identifier)
              setMenuOpen(false)
            }}
          />
          <Menu.Item
            icon="cog"
            text={getString('launchStudio')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              ;(column as any).goToPipelineStudio(data.identifier)
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
          color={deployments ? Color.BLUE_500 : Color.GREY_400}
          className={`${deployments ? css.clickable : ''}`}
          onClick={event => {
            event.stopPropagation()
            ;(column as any).goToPipelineDetail(data.identifier)
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
  const { projectIdentifier, orgIdentifier, accountId } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  return (
    <RunPipelineModal pipelineIdentifier={rowdata.identifier || ''}>
      <RbacButton
        style={{ textAlign: 'end' }}
        intent="primary"
        icon="run-pipeline"
        className={css.runPipelineListBtn}
        permission={{
          resourceScope: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier
          },
          resource: {
            resourceType: ResourceType.PIPELINE,
            resourceIdentifier: rowdata.identifier as string
          },
          permission: PermissionIdentifier.EXECUTE_PIPELINE
        }}
      />
    </RunPipelineModal>
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
  const columns: CustomColumn<PipelineDTO>[] = React.useMemo(
    () => [
      {
        Header: getString('common.pipeline').toUpperCase(),
        accessor: 'name',
        width: '35%',
        Cell: RenderColumnPipeline
      },
      {
        Header: getString('activity').toUpperCase(),
        accessor: 'executionSummaryInfo',
        width: '25%',
        Cell: RenderActivity,
        disableSortBy: true,
        goToPipelineDetail
      },
      {
        Header: getString('lastExecutionTs').toUpperCase(),
        accessor: 'description',
        width: '25%',
        Cell: RenderLastRun,
        disableSortBy: true
      },
      {
        Header: getString('runPipelineText').toUpperCase(),
        accessor: 'tags',
        width: '10%',
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
    [refetchPipeline, goToPipelineStudio]
  )
  return (
    <Table<PipelineDTO>
      className={css.table}
      columns={columns}
      data={data?.content || []}
      onRowClick={item => goToPipelineStudio(item.identifier)}
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
