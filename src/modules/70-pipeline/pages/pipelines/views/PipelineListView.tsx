import React from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import {
  Button,
  Color,
  Layout,
  Popover,
  Text,
  SparkChart,
  Icon,
  ButtonVariation,
  TagsPopover,
  TableV2
} from '@wings-software/uicore'
import { Classes, Menu, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import { GitDetailsColumn } from '@common/components/Table/GitDetailsColumn/GitDetailsColumn'
import useDeleteConfirmationDialog from '@pipeline/pages/utils/DeleteConfirmDialog'
import type { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { usePermission } from '@rbac/hooks/usePermission'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { formatCount } from '@common/utils/utils'
import { useRunPipelineModal } from '@pipeline/components/RunPipelineModal/useRunPipelineModal'
import { getIconsForPipeline, getStatusColor } from '../PipelineListUtils'
import css from '../PipelinesPage.module.scss'

interface PipelineListViewProps {
  data?: PagePMSPipelineSummaryResponse
  gotoPage: (pageNumber: number) => void
  goToPipelineDetail: (pipeline?: PMSPipelineSummaryResponse) => void
  goToPipelineStudio: (pipeline?: PMSPipelineSummaryResponse) => void
  refetchPipeline: () => void
  onDeletePipeline: (commitMsg: string) => Promise<void>
  onDelete: (pipeline: PMSPipelineSummaryResponse) => void
}

// Todo: Remove this when BE updated
export interface PipelineDTO extends PMSPipelineSummaryResponse {
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
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
    module: string
  }>()

  const { confirmDelete } = useDeleteConfirmationDialog(data, 'pipeline', (column as any).onDeletePipeline)
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

  const runPipeline = (): void => {
    openRunPipelineModal()
  }

  const { openRunPipelineModal } = useRunPipelineModal({
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
          <RbacMenuItem
            icon="play"
            text={getString('runPipelineText')}
            disabled={!canRun}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              runPipeline()
            }}
            featureProps={{
              featureRequest: {
                featureName: module === 'cd' ? FeatureIdentifier.DEPLOYMENTS : FeatureIdentifier.BUILDS
              }
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
          {/* <Menu.Item
            icon="duplicate"
            text={getString('projectCard.clone')}
            disabled
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
            }}
          /> */}
          <Menu.Item
            icon="trash"
            text={getString('delete')}
            disabled={!canDelete}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              ;(column as any).onDelete(data)
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
          ({getString('pipeline.lastSevenDays')})
        </Text>
      </div>

      <Text color={Color.GREY_400} font="medium" iconProps={{ size: 18 }}>
        {formatCount(deployments)}
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

  const runPipeline = (): void => {
    openRunPipelineModal()
  }

  const { openRunPipelineModal } = useRunPipelineModal({
    pipelineIdentifier: (rowdata.identifier || '') as string,
    repoIdentifier: rowdata.gitDetails?.repoIdentifier,
    branch: rowdata.gitDetails?.branch
  })

  return (
    <RbacButton
      variation={ButtonVariation.PRIMARY}
      intent="success"
      icon="run-pipeline"
      className={css.runPipelineListBtn}
      permission={{
        resource: {
          resourceType: ResourceType.PIPELINE,
          resourceIdentifier: rowdata.identifier as string
        },
        permission: PermissionIdentifier.EXECUTE_PIPELINE
      }}
      featureProps={{ featureRequest: { featureName: FeatureIdentifier.DEPLOYMENTS } }}
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
  goToPipelineStudio,
  onDeletePipeline,
  onDelete
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
        Cell: GitDetailsColumn,
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
        goToPipelineDetail,
        onDeletePipeline,
        onDelete
      }
    ],
    [refetchPipeline, goToPipelineStudio, isGitSyncEnabled]
  )

  if (!isGitSyncEnabled) {
    columns.splice(2, 1)
  }

  return (
    <TableV2<PipelineDTO>
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
