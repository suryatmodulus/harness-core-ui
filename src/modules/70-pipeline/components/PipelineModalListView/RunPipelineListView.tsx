import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { Column, CellProps, Renderer } from 'react-table'
import { Layout, Color, Text, Icon } from '@wings-software/uicore'
import Table from '@common/components/Table/Table'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import type { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { String, useStrings } from 'framework/strings'

import routes from '@common/RouteDefinitions'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from './PipelineModalListView.module.scss'

type CustomColumn<T extends Record<string, any>> = Column<T> & {
  reload?: () => Promise<void>
}

interface PipelineDTO extends PMSPipelineSummaryResponse {
  admin?: string
  collaborators?: string
  status?: string
}

interface PipelineListViewProps {
  data?: PagePMSPipelineSummaryResponse
  refetch?: () => void
  gotoPage: (pageNumber: number) => void
}

export default function RunPipelineListView({ data, refetch, gotoPage }: PipelineListViewProps): React.ReactElement {
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    }>
  >()

  const history = useHistory()
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()

  const routeToPipelinesPage = (pipeline: PipelineDTO): void => {
    history.push(
      routes.toRunPipeline({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier: pipeline.identifier || '',
        module,
        branch: pipeline.gitDetails?.branch,
        repoIdentifier: pipeline.gitDetails?.repoIdentifier
      })
    )
  }

  const RenderColumnPipeline: Renderer<CellProps<PipelineDTO>> = ({ row }) => {
    const rowdata = row.original

    return (
      <Layout.Vertical spacing="small" data-testid={rowdata.identifier}>
        <Text color={Color.GREY_800} iconProps={{ size: 16 }}>
          {rowdata.name}
        </Text>
        <Text color={Color.GREY_400}>{rowdata.description}</Text>
      </Layout.Vertical>
    )
  }

  const RenderGitDetails: Renderer<CellProps<PipelineDTO>> = ({ row }) => {
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

  const RenderLastRunDate: Renderer<CellProps<PipelineDTO>> = ({ row }) => {
    const rowdata = row.original

    return (
      <Layout.Vertical spacing="xsmall">
        <Text color={Color.GREY_400}>
          {rowdata.executionSummaryInfo?.lastExecutionTs
            ? formatDatetoLocale(rowdata.executionSummaryInfo?.lastExecutionTs)
            : getString('pipelineSteps.pullNeverLabel')}
        </Text>
      </Layout.Vertical>
    )
  }

  const RenderColumnMenu: Renderer<CellProps<PipelineDTO>> = ({ row }): JSX.Element => {
    const rowdata = row.original
    return (
      <RbacButton
        icon="run-pipeline"
        className={css.rbacButton}
        intent="primary"
        text={<String stringID="runPipeline" />}
        onClick={() => routeToPipelinesPage(rowdata)}
        permission={{
          resource: {
            resourceType: ResourceType.PIPELINE,
            resourceIdentifier: rowdata.identifier as string
          },
          permission: PermissionIdentifier.EXECUTE_PIPELINE
        }}
      />
    )
  }
  const columns: CustomColumn<PipelineDTO>[] = React.useMemo(
    () => [
      {
        Header: getString('common.pipeline').toUpperCase(),
        accessor: 'name',
        width: isGitSyncEnabled ? '27.5%' : '50%',
        Cell: RenderColumnPipeline
      },
      {
        Header: getString('common.gitSync.repoDetails').toUpperCase(),
        accessor: 'gitDetails',
        width: isGitSyncEnabled ? '27.5%' : 0,
        Cell: RenderGitDetails
      },
      {
        Header: getString('lastExecutionTs').toUpperCase(),
        accessor: 'executionSummaryInfo',
        width: isGitSyncEnabled ? '25%' : '30%',
        Cell: RenderLastRunDate
      },
      {
        accessor: 'tags',
        width: isGitSyncEnabled ? '20%' : '20%',
        Cell: RenderColumnMenu,
        disableSortBy: true
      }
    ],
    [refetch]
  )

  if (!isGitSyncEnabled) {
    columns.splice(1, 1)
  }

  return (
    <Table<PipelineDTO>
      className={css.table}
      columns={columns}
      data={data?.content || []}
      pagination={{
        itemCount: data?.totalElements || 0,
        pageSize: data?.size || 10,
        pageCount: data?.totalPages ?? 1,
        pageIndex: data?.number ?? 0,
        gotoPage
      }}
    />
  )
}
