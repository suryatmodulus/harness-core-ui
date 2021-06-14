import React from 'react'
import { useParams } from 'react-router-dom'
import { Text, Icon, OverlaySpinner, Container, Layout, Color } from '@wings-software/uicore'

import { useGetListOfExecutions, useGetFilterList, GetListOfExecutionsQueryParams } from 'services/pipeline-ng'
import { String, useStrings } from 'framework/strings'
import { Page, StringUtils } from '@common/exports'
import { useQueryParams, useMutateAsGet, useUpdateQueryParams } from '@common/hooks'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'

import RbacButton from '@rbac/components/Button/Button'
import PipelineSummaryCards from '@pipeline/components/Dashboards/PipelineSummaryCards/PipelineSummaryCards'
import PipelineBuildExecutionsChart from '@pipeline/components/Dashboards/BuildExecutionsChart/PipelineBuildExecutionsChart'
import ExecutionsList from './ExecutionsList/ExecutionsList'
import ExecutionsPagination from './ExecutionsPagination/ExecutionsPagination'
import { PipelineDeploymentListHeader } from './PipelineDeploymentListHeader/PipelineDeploymentListHeader'
import { FilterContextProvider } from './FiltersContext/FiltersContext'
import type { QueryParams, StringQueryParams, QuickStatusParam } from './types'
import css from './PipelineDeploymentList.module.scss'

const pollingIntervalInMilliseconds = 5_000

export interface PipelineDeploymentListProps {
  onRunPipeline(): void
  showHealthAndExecution?: boolean
}

export default function PipelineDeploymentList(props: PipelineDeploymentListProps): React.ReactElement {
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module } = useParams<
    PipelineType<PipelinePathProps>
  >()
  const [pollingRequest, setPollingRequest] = React.useState(false)
  const queryParams = useQueryParams<QueryParams>({
    processQueryParams(params: StringQueryParams) {
      let filters = {}

      try {
        filters = JSON.parse(params.filters || '{}')
      } catch (_e) {
        // do nothing
      }

      return {
        ...params,
        page: parseInt(params.page || '1', 10),
        size: parseInt(params.size || '10', 10),
        sort: [],
        status: params.status as QuickStatusParam,
        myDeployments: !!params.myDeployments,
        filters,
        repoIdentifier: params.repoIdentifier,
        branch: params.branch
      }
    }
  })
  const { updateQueryParams } = useUpdateQueryParams<Partial<GetListOfExecutionsQueryParams>>()

  const { page, filterIdentifier, myDeployments, status, repoIdentifier, branch } = queryParams
  const hasFilters =
    [pipelineIdentifier, status, filterIdentifier].some(filter => filter !== undefined) || myDeployments

  const isCIModule = module === 'ci'
  const { getString } = useStrings()
  const hasFilterIdentifier = filterIdentifier && filterIdentifier !== StringUtils.getIdentifierFromName(UNSAVED_FILTER)

  useDocumentTitle([getString('pipelines'), getString('executionsText')])

  const { data, loading, refetch: fetchExecutions, error } = useMutateAsGet(useGetListOfExecutions, {
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      module,
      pipelineIdentifier: pipelineIdentifier || queryParams.pipelineIdentifier,
      page: page ? page - 1 : 0,
      filterIdentifier: hasFilterIdentifier ? filterIdentifier : undefined,
      myDeployments,
      status,
      repoIdentifier,
      branch
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    body: hasFilterIdentifier
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (null as any)
      : {
          ...queryParams.filters,
          filterType: 'PipelineExecution'
        }
  })

  const { data: filterData, loading: isFetchingFilters, refetch: refetchFilters } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      type: 'PipelineExecution'
    }
  })
  const pipelineExecutionSummary = data?.data || {}
  const filters = filterData?.data?.content || []
  /* #region Polling logic */
  //  - At any moment of time, only one polling is done
  //  - Only do polling on first page
  //  - When component is loading, wait until loading is done
  //  - When polling call (API) is being processed, wait until it's done then re-schedule
  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (page === 1 && !loading) {
        setPollingRequest(true)
        fetchExecutions()?.then(
          () => setPollingRequest(false),
          () => setPollingRequest(false)
        )
      }
    }, pollingIntervalInMilliseconds)

    return () => {
      window.clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, loading])

  const clearFilters = (): void => {
    updateQueryParams({
      status: [] as any,
      myDeployments: [] as any,
      pipelineIdentifier: [] as any,
      filterIdentifier: [] as any
    }) // removes the param
  }

  return (
    <Page.Body
      className={css.main}
      key={pipelineIdentifier}
      error={(error?.data as Error)?.message || error?.message}
      retryOnError={() => fetchExecutions()}
    >
      {props.showHealthAndExecution && (
        <Container className={css.healthAndExecutions}>
          <PipelineSummaryCards />
          <PipelineBuildExecutionsChart />
        </Container>
      )}

      <FilterContextProvider
        savedFilters={filters}
        isFetchingFilters={isFetchingFilters}
        refetchFilters={refetchFilters}
        queryParams={queryParams}
      >
        {!!pipelineExecutionSummary?.content?.length && (
          <PipelineDeploymentListHeader onRunPipeline={props.onRunPipeline} />
        )}
        {loading && !pollingRequest ? (
          <OverlaySpinner show={true} className={css.loading}>
            <div />
          </OverlaySpinner>
        ) : !pipelineExecutionSummary?.content?.length ? (
          <div className={css.noDeploymentSection}>
            {hasFilters ? (
              <Layout.Vertical spacing="small" flex>
                <Icon size={50} name={isCIModule ? 'ci-main' : 'cd-hover'} margin={{ bottom: 'large' }} />
                <Text
                  margin={{ top: 'large', bottom: 'small' }}
                  font={{ weight: 'bold', size: 'medium' }}
                  color={Color.GREY_800}
                >
                  {getString('common.filters.noMatchingFilterData')}
                </Text>
                <String stringID="common.filters.clearFilters" className={css.clearFilterText} onClick={clearFilters} />
              </Layout.Vertical>
            ) : (
              <Layout.Vertical spacing="small" flex={{ justifyContent: 'center', alignItems: 'center' }} width={720}>
                <Icon size={320} name="deployments-illustration" />
                <Text className={css.noDeploymentText} margin={{ top: 'medium', bottom: 'small' }}>
                  {getString(isCIModule ? 'pipeline.noBuildsText' : 'pipeline.noDeploymentText')}
                </Text>
                <Text className={css.aboutDeployment} margin={{ top: 'xsmall', bottom: 'xlarge' }}>
                  {getString(isCIModule ? 'noBuildsText' : 'noDeploymentText')}
                </Text>
                <RbacButton
                  intent="primary"
                  text={getString('pipeline.runAPipeline')}
                  onClick={props.onRunPipeline}
                  permission={{
                    permission: PermissionIdentifier.EXECUTE_PIPELINE,
                    resource: {
                      resourceType: ResourceType.PIPELINE,
                      resourceIdentifier: pipelineIdentifier || queryParams.pipelineIdentifier
                    },
                    options: {
                      skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
                    }
                  }}
                />
              </Layout.Vertical>
            )}
          </div>
        ) : (
          <React.Fragment>
            <ExecutionsList pipelineExecutionSummary={pipelineExecutionSummary?.content} />
            <ExecutionsPagination pipelineExecutionSummary={pipelineExecutionSummary} />
          </React.Fragment>
        )}
      </FilterContextProvider>
    </Page.Body>
  )
}
