import React, { useState, useEffect } from 'react'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { useModalHook, SelectOption, Layout, Button, Text, Icon, OverlaySpinner } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import {
  useGetListOfExecutions,
  PagePipelineExecutionSummary,
  GetListOfExecutionsQueryParams,
  usePostFilter,
  useUpdateFilter,
  useGetFilterList,
  FilterDTO,
  useDeleteFilter,
  PipelineExecutionFilterProperties,
  GetFilterListQueryParams
} from 'services/pipeline-ng'
import { useStrings } from 'framework/exports'
import { Page, StringUtils, useToaster } from '@common/exports'
import { useQueryParams } from '@common/hooks'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import type { FilterInterface, FilterDataInterface } from '@common/components/Filter/Constants'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { shouldShowError } from '@common/utils/errorUtils'
import {
  isObjectEmpty,
  UNSAVED_FILTER,
  removeNullAndEmpty,
  flattenObject
} from '@common/components/Filter/utils/FilterUtils'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import ExecutionsFilter, { FilterQueryParams } from './ExecutionsFilter/ExecutionsFilter'
import ExecutionsList from './ExecutionsList/ExecutionsList'
import ExecutionsPagination from './ExecutionsPagination/ExecutionsPagination'
import {
  createRequestBodyPayload,
  PipelineExecutionFormType,
  getValidFilterArguments,
  getBuildType,
  BUILD_TYPE
} from '../../utils/RequestUtils'
import ExecutionsFilterForm from './ExecutionsFilterForm/ExecutionsFilterForm'
import css from './PipelineDeploymentList.module.scss'

const pollingIntervalInMilliseconds = 5_000
export interface PipelineDeploymentListProps {
  onRunPipeline(): void
}

export default function PipelineDeploymentList(props: PipelineDeploymentListProps): React.ReactElement {
  const [pipelineExecutionSummary, setPipelineExecutionSummary] = useState<PagePipelineExecutionSummary>()
  const [error, setError] = useState<Error | null>(null)
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module } = useParams<
    PipelineType<PipelinePathProps>
  >()
  const queryParams = useQueryParams<{ page?: string } & FilterQueryParams>()
  const page = parseInt(queryParams.page || '1', 10)
  const [initLoading, setInitLoading] = React.useState(true)
  const { getString } = useStrings()
  const { showError } = useToaster()
  useDocumentTitle([getString('pipelines'), getString('executionsText')])
  const [isRefreshingFilters, setIsRefreshingFilters] = useState<boolean>(false)
  const [appliedFilter, setAppliedFilter] = useState<FilterDTO | null>()
  const [filters, setFilters] = useState<FilterDTO[]>()
  const filterRef = React.useRef<FilterRef<FilterDTO> | null>(null)

  const defaultQueryParamsForExecutions: GetListOfExecutionsQueryParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    module,
    pipelineIdentifier,
    page: page - 1
  }

  /* #regions Fetch executions */
  const { loading, mutate: fetchListOfExecutions, cancel } = useGetListOfExecutions({
    queryParams: defaultQueryParamsForExecutions,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const fetchExecutions = React.useCallback(
    async (params?: GetListOfExecutionsQueryParams, formData?: PipelineExecutionFilterProperties): Promise<void> => {
      try {
        cancel()
        setError(null)
        const filter = Object.assign(
          {
            filterType: 'PipelineExecution'
          },
          isObjectEmpty(formData || {}) ? appliedFilter?.filterProperties : formData
        ) as PipelineExecutionFilterProperties
        const { status, data } = await fetchListOfExecutions(filter, { queryParams: params })
        if (status === 'SUCCESS') {
          setInitLoading(false)
          setPipelineExecutionSummary(data)
        }
      } catch (e) {
        if (shouldShowError(e)) {
          showError(e.data?.message || e.message)
          setError(e)
        }
      }
    },
    [fetchListOfExecutions, showError, cancel, appliedFilter?.filterProperties]
  )

  useEffect(() => {
    if (appliedFilter !== undefined) {
      fetchExecutions(defaultQueryParamsForExecutions, appliedFilter?.filterProperties || {})
    }
  }, [appliedFilter?.filterProperties])

  useEffect(() => {
    cancel()
    setInitLoading(true)
    fetchExecutions(defaultQueryParamsForExecutions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, accountId, projectIdentifier, orgIdentifier, pipelineIdentifier])

  const hasFilters: boolean = !!queryParams.query || !!queryParams.pipeline || !!queryParams.status
  const isCIModule = module === 'ci'

  /* #region Polling logic */
  //  - At any moment of time, only one polling is done
  //  - Only do polling on first page
  //  - When component is loading, wait until loading is done
  //  - When polling call (API) is being processed, wait until it's done then re-schedule
  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (page === 1 && !loading) {
        fetchExecutions(defaultQueryParamsForExecutions)
      }
    }, pollingIntervalInMilliseconds)

    return () => {
      window.clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, loading, accountId, projectIdentifier, orgIdentifier, pipelineIdentifier])
  /* #endregion */

  /* #endregion */

  const reset = (): void => {
    setAppliedFilter(null)
    setError(null)
  }

  const getFilterByIdentifier = (identifier: string): FilterDTO | undefined =>
    filters?.find((filter: FilterDTO) => filter.identifier?.toLowerCase() === identifier.toLowerCase())
  /* #region FIlter CRUD operations */
  const defaultQueryParamsForFilters: GetFilterListQueryParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    type: 'PipelineExecution'
  }

  const {
    loading: isFetchingFilters,
    data: fetchedFilterResponse,
    error: errorFetchingFilters,
    refetch: refetchFilterList
  } = useGetFilterList({
    queryParams: defaultQueryParamsForFilters
  })
  if (errorFetchingFilters) {
    if (errorFetchingFilters?.data) {
      showError(errorFetchingFilters?.data)
    } else {
      showError(errorFetchingFilters?.message)
    }
  }

  useEffect(() => {
    setFilters(fetchedFilterResponse?.data?.content || [])
    setIsRefreshingFilters(isFetchingFilters)
  }, [fetchedFilterResponse])

  const { mutate: createFilter } = usePostFilter({
    queryParams: defaultQueryParamsForFilters
  })

  const { mutate: updateFilter } = useUpdateFilter({
    queryParams: defaultQueryParamsForFilters
  })

  const { mutate: deleteFilter } = useDeleteFilter({
    queryParams: defaultQueryParamsForFilters
  })
  /* #endregion */

  /* #region Filter interaction callback handlers */
  const handleSaveOrUpdate = async (
    isUpdate: boolean,
    data: FilterDataInterface<PipelineExecutionFormType, FilterInterface>
  ): Promise<void> => {
    setIsRefreshingFilters(true)
    const requestBodyPayload = createRequestBodyPayload({ isUpdate, data, projectIdentifier, orgIdentifier })
    const saveOrUpdateHandler = filterRef.current?.saveOrUpdateFilterHandler
    if (saveOrUpdateHandler && typeof saveOrUpdateHandler === 'function') {
      const updatedFilter = await saveOrUpdateHandler(isUpdate, requestBodyPayload)
      setAppliedFilter(updatedFilter)
    }
    await refetchFilterList()
    setIsRefreshingFilters(false)
  }

  const handleDelete = async (identifier: string): Promise<void> => {
    setIsRefreshingFilters(true)
    const deleteHandler = filterRef.current?.deleteFilterHandler
    if (deleteHandler && typeof deleteFilter === 'function') {
      await deleteHandler(identifier)
    }
    if (identifier === appliedFilter?.identifier) {
      reset()
    }
    await refetchFilterList()
    setIsRefreshingFilters(false)
  }

  /* #endregion CRUD filter interactions */
  const unsavedFilter = {
    name: UNSAVED_FILTER,
    identifier: StringUtils.getIdentifierFromName(UNSAVED_FILTER)
  }

  const getMultiSelectFormOptions = (values?: any[]): SelectOption[] | undefined => {
    return values?.map(item => {
      return { label: item, value: item }
    })
  }

  const [openFilterDrawer, hideFilterDrawer] = useModalHook(() => {
    const onApply = (inputFormData: FormikProps<PipelineExecutionFormType>['values']) => {
      if (!isObjectEmpty(inputFormData)) {
        const filterFromFormData = getValidFilterArguments({ ...inputFormData })
        setAppliedFilter({ ...unsavedFilter, filterProperties: filterFromFormData || {} })
        hideFilterDrawer()
      } else {
        showError(getString('filters.invalidCriteria'))
      }
    }

    const handleFilterClick = (identifier: string): void => {
      if (identifier !== unsavedFilter.identifier) {
        const selectedFilter = getFilterByIdentifier(identifier)
        setAppliedFilter(selectedFilter)
      }
    }

    const { pipelineName, status, moduleProperties } =
      (appliedFilter?.filterProperties as PipelineExecutionFilterProperties) || {}
    const { name = '', filterVisibility, identifier = '' } = appliedFilter || {}
    const { branch, tag, ciExecutionInfoDTO } = moduleProperties?.ci || {}
    const { sourceBranch, targetBranch } = ciExecutionInfoDTO?.pullRequest || {}
    // eslint-disable-next-line no-shadow
    const buildType = getBuildType(moduleProperties || {})

    return isFetchingFilters && isRefreshingFilters ? (
      <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
        <OverlaySpinner show={true} className={css.loading}>
          <></>
        </OverlaySpinner>
      </div>
    ) : (
      <Filter<PipelineExecutionFormType, FilterDTO>
        formFields={<ExecutionsFilterForm />}
        initialFilter={{
          formValues: {
            pipelineName,
            status: getMultiSelectFormOptions(status),
            branch,
            tag,
            sourceBranch,
            targetBranch,
            buildType
          },
          metadata: { name, filterVisibility, identifier, filterProperties: {} }
        }}
        filters={filters}
        isRefreshingFilters={isRefreshingFilters}
        onApply={onApply}
        onClose={() => hideFilterDrawer()}
        onSaveOrUpdate={handleSaveOrUpdate}
        onDelete={handleDelete}
        onFilterSelect={handleFilterClick}
        onClear={reset}
        ref={filterRef}
        dataSvcConfig={
          new Map<CrudOperation, Function>([
            ['ADD', createFilter],
            ['UPDATE', updateFilter],
            ['DELETE', deleteFilter]
          ])
        }
        onSuccessfulCrudOperation={refetchFilterList}
        validationSchema={Yup.object().shape({
          sourceBranch: Yup.string().when('buildType', {
            is: BUILD_TYPE.PULL_OR_MERGE_REQUEST,
            then: Yup.string().required()
          }),
          targetBranch: Yup.string().when('buildType', {
            is: BUILD_TYPE.PULL_OR_MERGE_REQUEST,
            then: Yup.string().required()
          }),
          branch: Yup.string().when('buildType', {
            is: BUILD_TYPE.BRANCH,
            then: Yup.string().required()
          }),
          tag: Yup.string().when('buildType', {
            is: BUILD_TYPE.TAG,
            then: Yup.string().required()
          })
        })}
      />
    )
  }, [isRefreshingFilters, appliedFilter, filters])

  /* #region Filter Selection */

  const handleFilterSelection = (
    option: SelectOption,
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ): void => {
    event?.stopPropagation()
    event?.preventDefault()
    /* istanbul ignore else */
    if (option.value) {
      const selectedFilter = getFilterByIdentifier(option.value?.toString())
      const aggregatedFilter = selectedFilter?.filterProperties || {}
      const combinedFilter = Object.assign(selectedFilter, { filterProperties: aggregatedFilter })
      setAppliedFilter(combinedFilter)
    } else {
      reset()
    }
  }

  const fieldToLabelMapping = new Map<string, string>()
  fieldToLabelMapping.set('pipelineName', getString('filters.executions.pipelineName'))
  fieldToLabelMapping.set('status', getString('status'))
  fieldToLabelMapping.set('sourceBranch', getString('pipeline-triggers.conditionsPanel.sourceBranch'))
  fieldToLabelMapping.set('targetBranch', getString('pipeline-triggers.conditionsPanel.targetBranch'))
  fieldToLabelMapping.set('branch', getString('pipelineSteps.deploy.inputSet.branch'))
  fieldToLabelMapping.set('tag', getString('tagLabel'))
  fieldToLabelMapping.set('buildType', getString('filters.executions.buildType'))

  const filterWithValidFields = flattenObject(
    removeNullAndEmpty(
      pick(
        appliedFilter?.filterProperties,
        ...[
          [
            'pipelineName',
            'status',
            'buildType',
            'moduleProperties.ci.branch',
            'moduleProperties.ci.tag',
            'moduleProperties.ci.ciExecutionInfoDTO.pullRequest.sourceBranch',
            'moduleProperties.ci.ciExecutionInfoDTO.pullRequest.targetBranch'
          ]
        ]
      ) || {}
    )
  )

  const filterWithValidFieldsWithMetaInfo =
    filterWithValidFields.sourceBranch && filterWithValidFields.targetBranch
      ? Object.assign(filterWithValidFields, { buildType: getString('filters.executions.pullOrMergeRequest') })
      : filterWithValidFields.branch
      ? Object.assign(filterWithValidFields, { buildType: getString('pipelineSteps.deploy.inputSet.branch') })
      : filterWithValidFields.tag
      ? Object.assign(filterWithValidFields, { buildType: getString('tagLabel') })
      : filterWithValidFields

  /* #endregion */

  return (
    <Page.Body
      className={css.main}
      key={pipelineIdentifier}
      error={error?.message}
      retryOnError={() => fetchExecutions()}
    >
      <React.Fragment>
        <Layout.Horizontal flex>
          <ExecutionsFilter onRunPipeline={props.onRunPipeline} />
          <FilterSelector<FilterDTO>
            appliedFilter={appliedFilter}
            filters={filters}
            onFilterBtnClick={openFilterDrawer}
            onFilterSelect={handleFilterSelection}
            fieldToLabelMapping={fieldToLabelMapping}
            filterWithValidFields={filterWithValidFieldsWithMetaInfo}
          />
        </Layout.Horizontal>
        {initLoading ? (
          <OverlaySpinner show={true} className={css.loading}>
            <></>
          </OverlaySpinner>
        ) : !pipelineExecutionSummary?.content?.length ? (
          hasFilters || appliedFilter ? (
            <Text padding={{ top: 'small', bottom: 'small' }} className={css.noData} font="medium">
              {getString('filters.noDataFound')}
            </Text>
          ) : (
            <div className={css.noData}>
              <Icon size={20} name={isCIModule ? 'ci-main' : 'cd-hover'}></Icon>
              <Text padding={{ top: 'small', bottom: 'small' }} font="medium">
                {getString(isCIModule ? 'noBuildsText' : 'noDeploymentText')}
              </Text>
              <Button intent="primary" onClick={props.onRunPipeline} text={getString('runPipelineText')}></Button>
            </div>
          )
        ) : (
          <>
            <ExecutionsList hasFilters={hasFilters} pipelineExecutionSummary={pipelineExecutionSummary?.content} />
            <ExecutionsPagination pipelineExecutionSummary={pipelineExecutionSummary} />
          </>
        )}
      </React.Fragment>
    </Page.Body>
  )
}
