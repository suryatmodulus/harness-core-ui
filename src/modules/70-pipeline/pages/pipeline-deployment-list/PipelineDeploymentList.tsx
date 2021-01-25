import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { MenuItem, PopoverInteractionKind, Position } from '@blueprintjs/core'
import {
  useModalHook,
  FormInput,
  Select,
  SelectOption,
  Layout,
  Popover,
  Button,
  Text,
  Icon,
  OverlaySpinner
} from '@wings-software/uicore'
import { pick, truncate } from 'lodash-es'
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
import { Filter } from '@common/components/Filter/Filter'
import type { FilterInterface, FilterDataInterface } from '@common/components/Filter/Constants'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { shouldShowError } from '@common/utils/errorUtils'
import { UNIQUE_ID_MAX_LENGTH } from '@common/utils/StringUtils'
import {
  getFilterSummary,
  isObjectEmpty,
  UNSAVED_FILTER,
  MAX_FILTER_NAME_LENGTH,
  removeNullAndEmpty
} from '@common/components/Filter/utils/FilterUtils'
import ExecutionsFilter, { FilterQueryParams } from './ExecutionsFilter/ExecutionsFilter'
import ExecutionsList from './ExecutionsList/ExecutionsList'
import ExecutionsPagination from './ExecutionsPagination/ExecutionsPagination'
import {
  getOptionsForMultiSelect,
  createRequestBodyPayload,
  PipelineExecutionFormType,
  getValidFilterArguments,
  BUILD_TYPE,
  getFilterSize,
  flattenObject,
  getBuildType
} from '../../utils/RequestUtils'

import css from './PipelineDeploymentList.module.scss'

const pollingIntervalInMilliseconds = 500_000
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
  const { showError, showSuccess } = useToaster()
  useDocumentTitle([getString('pipelines'), getString('executionsText')])
  const [isRefreshingFilters, setIsRefreshingFilters] = useState<boolean>(false)
  const [appliedFilter, setAppliedFilter] = useState<FilterDTO | null>()
  const [filters, setFilters] = useState<FilterDTO[]>()
  const [buildType, setBuildType] = useState<BUILD_TYPE>()

  const defaultQueryParamsForExecutions: GetListOfExecutionsQueryParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
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
      setInitLoading(true)
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
    [fetchListOfExecutions, showError, cancel]
  )

  useEffect(() => {
    if (appliedFilter !== undefined) {
      fetchExecutions(defaultQueryParamsForExecutions, appliedFilter?.filterProperties || {})
    }
  }, [appliedFilter?.identifier])

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

  const getBuildTypeOptions = (): SelectOption[] => {
    return [
      { label: getString('filters.executions.pullOrMergeRequest'), value: BUILD_TYPE.PULL_OR_MERGE_REQUEST },
      { label: getString('pipelineSteps.deploy.inputSet.branch'), value: BUILD_TYPE.BRANCH },
      { label: getString('tagLabel'), value: BUILD_TYPE.TAG }
    ]
  }

  const handleBuildTypeChange = (item: SelectOption, event?: React.SyntheticEvent<HTMLElement, Event> | undefined) => {
    event?.preventDefault()
    setBuildType(item.value as BUILD_TYPE)
  }

  const getPipelineFormFieldsWithBuildTypeOptions = (): JSX.Element[] => {
    let buildTypeField: JSX.Element = <></>
    switch (buildType) {
      case BUILD_TYPE.PULL_OR_MERGE_REQUEST:
        buildTypeField = (
          <div className={css.subfilter} key="buildSubType">
            <FormInput.Text
              name={'sourceBranch'}
              label={getString('pipeline-triggers.conditionsPanel.sourceBranch')}
              key={'sourceBranch'}
              placeholder={getString('enterNamePlaceholder')}
            />
            <FormInput.Text
              name={'targetBranch'}
              label={getString('pipeline-triggers.conditionsPanel.targetBranch')}
              key={'targetBranch'}
              placeholder={getString('enterNamePlaceholder')}
            />
          </div>
        )
        break
      case BUILD_TYPE.BRANCH:
        buildTypeField = (
          <div className={css.subfilter} key="buildSubType">
            <FormInput.Text
              name={'branch'}
              label={getString('pipelineSteps.deploy.inputSet.branch')}
              key={'branch'}
              placeholder={getString('enterNamePlaceholder')}
            />
          </div>
        )
        break
      case BUILD_TYPE.TAG:
        buildTypeField = (
          <div className={css.subfilter} key="buildSubType">
            <FormInput.Text
              name={'tag'}
              label={getString('tagLabel')}
              key={'tag'}
              placeholder={getString('filters.executions.tagPlaceholder')}
            />
          </div>
        )
        break
      default:
        break
    }
    const fixedFields = getPipelineFormFields()
    fixedFields.push(buildTypeField)
    return fixedFields
  }

  const getPipelineFormFields = (): JSX.Element[] => {
    return [
      <FormInput.Text
        name={'pipelineName'}
        label={getString('filters.executions.pipelineName')}
        key={'pipelineName'}
        placeholder={getString('enterNamePlaceholder')}
      />,
      <FormInput.MultiSelect
        items={getOptionsForMultiSelect()}
        name="status"
        label={getString('status')}
        key="status"
        multiSelectProps={{
          allowCreatingNewItems: false
        }}
      />,
      <span className={css.separator} key="buildsSeparator">
        <Text>{getString('buildsText').toUpperCase()}</Text>
      </span>,
      //TODO enable this later on when this field gets populated from backend
      // <FormInput.Text
      //   name={'repositoryName'}
      //   label={getString('pipelineSteps.build.create.repositoryNameLabel')}
      //   key={'repositoryName'}
      //   placeholder={getString('enterNamePlaceholder')}
      // />,
      <FormInput.Select
        items={getBuildTypeOptions()}
        name="buildType"
        label={getString('filters.executions.buildType')}
        key="buildType"
        onChange={handleBuildTypeChange}
      />
    ]
  }

  const reset = (): void => {
    setAppliedFilter(null)
    setError(null)
    setBuildType(undefined)
  }

  const getFilterByIdentifier = (identifier: string): FilterDTO | undefined =>
    /* istanbul ignore if */
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
  const onClose = () => hideFilterDrawer()
  const handleSaveOrUpdate = async (
    isUpdate: boolean,
    data: FilterDataInterface<PipelineExecutionFormType, FilterInterface>
  ): Promise<void> => {
    setIsRefreshingFilters(true)
    const requestBodyPayload = createRequestBodyPayload({ isUpdate, data, projectIdentifier, orgIdentifier })
    try {
      const { status, data: updatedFilter } = isUpdate
        ? await updateFilter(requestBodyPayload)
        : await createFilter(requestBodyPayload)
      if (status === 'SUCCESS') {
        showSuccess(`${requestBodyPayload?.name} ${isUpdate ? 'updated' : 'saved'}.`)
        await refetchFilterList()
        if (isUpdate) {
          setAppliedFilter(updatedFilter)
        }
      }
    } /* istanbul ignore next */ catch (e) {
      showError(e.data?.message || e.message)
    }
    setIsRefreshingFilters(false)
  }

  const handleDelete = async (identifier: string): Promise<void> => {
    setIsRefreshingFilters(true)
    const matchingFilter = getFilterByIdentifier(identifier)
    if (!matchingFilter?.identifier) {
      showError(getString('somethingWentWrong'))
      return
    }
    try {
      const { status } = await deleteFilter(matchingFilter?.identifier || '')
      if (status === 'SUCCESS') {
        showSuccess(`${matchingFilter?.name} ${getString('filters.filterDeleted')}`)
        await refetchFilterList()
        if (matchingFilter?.identifier === appliedFilter?.identifier) {
          reset()
        }
      }
    } /* istanbul ignore next */ catch (e) {
      showError(e.data?.message || e.message)
    }
    setIsRefreshingFilters(false)
  }

  const handleDuplicate = async (identifier: string): Promise<void> => {
    setIsRefreshingFilters(true)
    const matchingFilter = getFilterByIdentifier(identifier)
    const { name: _name, filterVisibility: _filterVisibility, filterProperties } = matchingFilter as FilterDTO
    const uniqueId = new Date().getTime().toString()
    const duplicatedFilterName = (_name.concat(uniqueId) || '').substring(0, UNIQUE_ID_MAX_LENGTH)
    const requestBodyPayload = {
      name: duplicatedFilterName,
      identifier: StringUtils.getIdentifierFromName(duplicatedFilterName).concat(uniqueId),
      projectIdentifier,
      orgIdentifier,
      filterVisibility: _filterVisibility,
      filterProperties
    }
    try {
      const { status, data: duplicatedFilter } = await createFilter(requestBodyPayload)
      if (status === 'SUCCESS') {
        showSuccess(`${_name} ${getString('filters.filterDuplicated')}`)
        await refetchFilterList()
        setAppliedFilter(duplicatedFilter)
      }
    } /* istanbul ignore next */ catch (e) {
      showError(e.data?.message || e.message)
    }
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
        setBuildType(
          getBuildType((selectedFilter?.filterProperties as PipelineExecutionFilterProperties)?.moduleProperties || {})
        )
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
        formFields={getPipelineFormFieldsWithBuildTypeOptions()}
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
        onClose={onClose}
        onSaveOrUpdate={handleSaveOrUpdate}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onFilterSelect={handleFilterClick}
        onClear={reset}
      />
    )
  }, [isRefreshingFilters, appliedFilter, buildType])

  /* #region Filter Selection */

  const renderFilterBtn = (): JSX.Element => (
    <Button
      id="ngfilterbtn"
      icon="ng-filter"
      onClick={openFilterDrawer}
      className={css.ngFilter}
      width="32px"
      height="32px"
    />
  )

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
      setBuildType(
        getBuildType((combinedFilter?.filterProperties as PipelineExecutionFilterProperties)?.moduleProperties || {})
      )
    } else {
      reset()
    }
  }

  const fieldToLabelMapping = new Map<string, string>()
  fieldToLabelMapping.set('pipelineName', getString('filters.executions.pipelineName'))
  fieldToLabelMapping.set('status', getString('status'))
  fieldToLabelMapping.set('repositoryName', getString('pipelineSteps.build.create.repositoryNameLabel'))
  fieldToLabelMapping.set('sourceBranch', getString('pipeline-triggers.conditionsPanel.sourceBranch'))
  fieldToLabelMapping.set('targetBranch', getString('pipeline-triggers.conditionsPanel.targetBranch'))
  fieldToLabelMapping.set('branch', getString('pipelineSteps.deploy.inputSet.branch'))
  fieldToLabelMapping.set('tag', getString('tagLabel'))
  fieldToLabelMapping.set('buildType', getString('filters.executions.buildType'))

  const allValidKeys = [
    'pipelineName',
    'status',
    'repositoryName',
    'moduleProperties.ci.branch',
    'moduleProperties.ci.tag',
    'moduleProperties.ci.ciExecutionInfoDTO.pullRequest.sourceBranch',
    'moduleProperties.ci.ciExecutionInfoDTO.pullRequest.targetBranch',
    'buildType'
  ]
  const filterWithValidFields = flattenObject(
    removeNullAndEmpty(pick(appliedFilter?.filterProperties, ...allValidKeys) || {})
  )
  const filterWithValidFieldsWithMetaInfo =
    filterWithValidFields.sourceBranch && filterWithValidFields.targetBranch
      ? Object.assign(filterWithValidFields, { buildType: getString('filters.executions.pullOrMergeRequest') })
      : filterWithValidFields.branch
      ? Object.assign(filterWithValidFields, { buildType: getString('pipelineSteps.deploy.inputSet.branch') })
      : filterWithValidFields.tag
      ? Object.assign(filterWithValidFields, { buildType: getString('tagLabel') })
      : filterWithValidFields
  const fieldCountInAppliedFilter = getFilterSize(filterWithValidFieldsWithMetaInfo)

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
          {isCIModule ? (
            <Layout.Horizontal padding={{ top: 'large' }}>
              <Select
                className={css.filterSelector}
                items={
                  filters?.map((item: FilterDTO) => {
                    return {
                      label: truncate(item?.name, { length: MAX_FILTER_NAME_LENGTH }),
                      value: item?.identifier
                    } as SelectOption
                  }) || []
                }
                onChange={handleFilterSelection}
                addClearBtn={true}
                value={{ label: appliedFilter?.name || '', value: appliedFilter?.identifier || '' }}
                inputProps={{
                  placeholder: getString('filters.selectFilter')
                }}
                noResults={<MenuItem disabled={true} text="No filter found." />}
              />
              <div className={css.filterBtn}>
                {fieldCountInAppliedFilter ? (
                  <Popover
                    interactionKind={PopoverInteractionKind.HOVER}
                    position={Position.BOTTOM}
                    content={getFilterSummary(fieldToLabelMapping, filterWithValidFields)}
                    popoverClassName={css.summaryPopover}
                  >
                    {renderFilterBtn()}
                  </Popover>
                ) : (
                  renderFilterBtn()
                )}
              </div>
              <Layout.Horizontal>
                {fieldCountInAppliedFilter > 0 ? (
                  <span className={css.fieldCount}>{fieldCountInAppliedFilter}</span>
                ) : null}
              </Layout.Horizontal>
            </Layout.Horizontal>
          ) : null}
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
