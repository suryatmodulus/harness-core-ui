import React, { useState } from 'react'
import { Color, Container, Layout, Text, Icon } from '@wings-software/uicore'
import type { CellProps, Renderer } from 'react-table'
import ResourceHandlerTable, {
  ResourceHandlerTableData
} from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'
import { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse, useGetPipelineList } from 'services/pipeline-ng'
import { formatDatetoLocale } from '@common/utils/dateUtils'

interface PipelineDTO extends PMSPipelineSummaryResponse {
  admin?: string
  collaborators?: string
  status?: string
}

const RenderColumnPipeline: Renderer<CellProps<PipelineDTO>> = ({ row }) => {
  const rowdata = row.original

  return (
    <Layout.Vertical spacing="small" data-testid={rowdata.identifier}>
      <Text color={Color.GREY_800} iconProps={{ size: 18 }}>
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

const PipelineResourceModal: React.FC<RbacResourceModalProps> = ({
  searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}) => {
  const { accountIdentifier, orgIdentifier = '', projectIdentifier = '' } = resourceScope
  const [page, setPage] = useState(0)
  const [pipelineData, setData] = React.useState<PagePMSPipelineSummaryResponse | undefined>()
  const { getString } = useStrings()

  const { loading, mutate: reloadPipelines, cancel } = useGetPipelineList({
    queryParams: {
      accountIdentifier,
      projectIdentifier,
      orgIdentifier,
      module: 'cd',
      searchTerm,
      page,
      size: 10
    }
  })

  const fetchPipelines = React.useCallback(async () => {
    cancel()
    setData(await (await reloadPipelines({ filterType: 'PipelineSetup' })).data)
  }, [cancel])

  React.useEffect(() => {
    cancel()
    fetchPipelines()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, accountIdentifier, projectIdentifier, orgIdentifier, module])

  const pipelineContentData: PMSPipelineSummaryResponse[] = pipelineData?.content || []

  if (loading) return <PageSpinner />
  return pipelineContentData?.length ? (
    <Container>
      <ResourceHandlerTable
        data={pipelineContentData as ResourceHandlerTableData[]}
        selectedData={selectedData}
        columns={[
          {
            Header: getString('common.pipeline'),
            id: 'name',
            accessor: 'name' as any,
            Cell: RenderColumnPipeline,
            width: '60%',
            disableSortBy: true
          },
          {
            Header: getString('lastExecutionTs'),
            id: 'details',
            accessor: 'executionSummaryInfo',
            Cell: RenderLastRunDate,
            width: '20%',
            disableSortBy: true
          }
        ]}
        pagination={{
          itemCount: pipelineData?.totalElements || 0,
          pageSize: pipelineData?.size || 10,
          pageCount: pipelineData?.totalPages ?? 1,
          pageIndex: pipelineData?.number ?? 0,
          gotoPage: pageNumber => setPage(pageNumber)
        }}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
      <Icon name="resources-icon" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default PipelineResourceModal
