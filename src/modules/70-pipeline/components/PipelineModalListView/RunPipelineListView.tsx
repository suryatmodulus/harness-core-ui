import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { Column, CellProps, Renderer } from 'react-table'
import { Layout, Color, Text } from '@wings-software/uicore'
import Table from '@common/components/Table/Table'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import type { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { String, useStrings } from 'framework/strings'

import routes from '@common/RouteDefinitions'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
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
  hideHeaders?: boolean
  gotoPage: (pageNumber: number) => void
}

export default function RunPipelineListView({
  data,
  refetch,
  gotoPage,
  hideHeaders
}: PipelineListViewProps): React.ReactElement {
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    }>
  >()

  const history = useHistory()

  const routeToPipelinesPage = (identifier: string): void => {
    history.push(
      routes.toRunPipeline({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier: identifier,
        module
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

  const RenderLastRunDate: Renderer<CellProps<PipelineDTO>> = ({ row }) => {
    const rowdata = row.original
    const { getString } = useStrings()
    return (
      <Layout.Vertical spacing="xsmall">
        <Text color={Color.GREY_400}>Last run:</Text>
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
        intent="primary"
        text={<String stringID="runPipelineText" />}
        onClick={() => routeToPipelinesPage(rowdata.identifier || '')}
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
    )
  }
  const columns: CustomColumn<PipelineDTO>[] = React.useMemo(
    () => [
      {
        accessor: 'name',
        width: '60%',
        Cell: RenderColumnPipeline
      },
      {
        accessor: 'executionSummaryInfo',
        width: '20%',
        Cell: RenderLastRunDate
      },
      {
        accessor: 'tags',
        width: '20%',
        Cell: RenderColumnMenu,
        disableSortBy: true
      }
    ],
    [refetch]
  )

  return (
    <Table<PipelineDTO>
      className={css.table}
      columns={columns}
      data={data?.content || []}
      hideHeaders={hideHeaders}
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
