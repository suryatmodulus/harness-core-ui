import React, { useCallback } from 'react'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import StaticResourceRenderer from '@rbac/components/StaticResourceRenderer/StaticResourceRenderer'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import {
  PagePMSPipelineSummaryResponse,
  PipelineFilterProperties,
  PMSPipelineSummaryResponse,
  useGetPipelineList
} from 'services/pipeline-ng'
import type { ResourceHandlerTableData } from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { RenderColumnPipeline, RenderLastRunDate } from '../PipelineResourceModal/PipelineResourceModal'

const PipelineResourceRenderer: React.FC<RbacResourceRendererProps> = ({
  identifiers,
  resourceScope,
  resourceType,
  onResourceSelectionChange
}) => {
  const { accountIdentifier, orgIdentifier = '', projectIdentifier = '' } = resourceScope
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()
  const [pipelineData, setData] = React.useState<PagePMSPipelineSummaryResponse | undefined>()

  const {
    loading,
    mutate: reloadPipelines,
    cancel
  } = useGetPipelineList({
    queryParams: {
      accountIdentifier,
      projectIdentifier,
      orgIdentifier,
      size: 10,
      ...(isGitSyncEnabled ? { getDistinctFromBranches: true } : {})
    }
  })

  const fetchPipelines = useCallback(async () => {
    cancel()
    const filter = {
      filterType: 'PipelineSetup',
      pipelineIdentifiers: identifiers
    } as PipelineFilterProperties

    setData(await (await reloadPipelines(filter)).data)
  }, [cancel])

  React.useEffect(() => {
    cancel()
    fetchPipelines()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountIdentifier, projectIdentifier, orgIdentifier, module])

  const pipelineContentData: PMSPipelineSummaryResponse[] = pipelineData?.content || []

  return pipelineData && !loading ? (
    <StaticResourceRenderer
      data={pipelineContentData as ResourceHandlerTableData[]}
      resourceType={resourceType}
      onResourceSelectionChange={onResourceSelectionChange}
      columns={[
        {
          Header: getString('common.pipeline'),
          id: 'name',
          accessor: 'name' as any,
          Cell: RenderColumnPipeline,
          width: '40%',
          disableSortBy: true
        },
        {
          Header: getString('lastExecutionTs'),
          id: 'details',
          accessor: 'executionSummaryInfo',
          Cell: RenderLastRunDate,
          width: '55%',
          disableSortBy: true
        }
      ]}
    />
  ) : (
    <PageSpinner />
  )
}

export default PipelineResourceRenderer
