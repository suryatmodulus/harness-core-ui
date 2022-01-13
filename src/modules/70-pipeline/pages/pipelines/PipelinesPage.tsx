import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Color,
  ExpandingSearchInput,
  HarnessDocTooltip,
  Icon,
  Layout,
  OverlaySpinner,
  SelectOption,
  Text,
  useModalHook,
  GridListToggle,
  Views,
  ButtonVariation,
  DropDown,
  shouldShowError,
  PageSpinner,
  ExpandingSearchInputHandle
} from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { defaultTo, isEmpty, pick } from 'lodash-es'
import { Page, StringUtils, useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'
import {
  FilterDTO,
  GetFilterListQueryParams,
  GetPipelineListQueryParams,
  PagePMSPipelineSummaryResponse,
  PipelineFilterProperties,
  PMSPipelineSummaryResponse,
  ResponsePagePMSPipelineSummaryResponse,
  useDeleteFilter,
  useGetFilterList,
  useGetPipelineList,
  usePostFilter,
  useSoftDeletePipeline,
  useUpdateFilter
} from 'services/pipeline-ng'
import {
  useGetServiceListForProject,
  useGetEnvironmentListForProject,
  useGetServiceDefinitionTypes
} from 'services/cd-ng'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { UseGetMockData } from '@common/utils/testUtils'
import { String, useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { PipelineFeatureLimitBreachedBanner } from '@pipeline/factories/PipelineFeatureRestrictionFactory/PipelineFeatureRestrictionFactory'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import type { FilterDataInterface, FilterInterface } from '@common/components/Filter/Constants'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import { getBuildType, getFilterByIdentifier } from '@pipeline/utils/PipelineExecutionFilterRequestUtils'
import {
  createRequestBodyPayload,
  getValidFilterArguments,
  PipelineFormType,
  getMultiSelectFormOptions
} from '@pipeline/utils/PipelineFilterRequestUtils'
import {
  isObjectEmpty,
  UNSAVED_FILTER,
  removeNullAndEmpty,
  flattenObject
} from '@common/components/Filter/utils/FilterUtils'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { NavigatedToPage } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { PipelineGridView } from './views/PipelineGridView'
import { PipelineListView } from './views/PipelineListView'
import PipelineFilterForm from '../pipeline-deployment-list/PipelineFilterForm/PipelineFilterForm'
import pipelineIllustration from './images/pipelines-illustration.svg'

import css from './PipelinesPage.module.scss'

export enum Sort {
  DESC = 'DESC',
  ASC = 'ASC'
}

export enum SortFields {
  LastUpdatedAt = 'lastUpdatedAt',
  RecentActivity = 'executionSummaryInfo.lastExecutionTs',
  AZ09 = 'AZ09',
  ZA90 = 'ZA90',
  Name = 'name'
}

export interface CDPipelinesPageProps {
  mockData?: UseGetMockData<ResponsePagePMSPipelineSummaryResponse>
}

const PipelinesPage: React.FC<CDPipelinesPageProps> = ({ mockData }) => {
  const { getString } = useStrings()
  const sortOptions: SelectOption[] = [
    {
      label: getString('recentActivity'),
      value: SortFields.RecentActivity
    },
    {
      label: getString('lastUpdatedSort'),
      value: SortFields.LastUpdatedAt
    },
    {
      label: getString('AZ09'),
      value: SortFields.AZ09
    },
    {
      label: getString('ZA90'),
      value: SortFields.ZA90
    }
  ]

  const filterRef = useRef<FilterRef<FilterDTO> | null>(null)
  const [appliedFilter, setAppliedFilter] = useState<FilterDTO | null>()
  const [filters, setFilters] = useState<FilterDTO[]>()
  const [isRefreshingFilters, setIsRefreshingFilters] = useState<boolean>(false)
  const [gitFilter, setGitFilter] = useState<GitFilterScope | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const [page, setPage] = useState(0)
  const [view, setView] = useState<Views>(Views.GRID)
  const [sort, setStort] = useState<string[]>([SortFields.LastUpdatedAt, Sort.DESC])

  // Set Default to LastUpdated
  const [selectedSort, setSelectedSort] = useState<SelectOption>(sortOptions[1])
  const [searchParam, setSearchParam] = useState('')
  const [pipelineList, setPipelineList] = useState<PagePMSPipelineSummaryResponse | undefined>()
  const [isFetchingMetaData, setIsFetchingMetaData] = useState<boolean>(false)

  const { trackEvent } = useTelemetry()
  const history = useHistory()
  const { showSuccess, showError } = useToaster()
  const { selectedProject, isGitSyncEnabled } = useAppStore()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isReseting, setIsReseting] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [pipelineToDelete, setPipelineToDelete] = useState<PMSPipelineSummaryResponse>()

  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    }>
  >()

  const isCDEnabled = (selectedProject?.modules && selectedProject.modules?.indexOf('CD') > -1) || false
  const isCIEnabled = (selectedProject?.modules && selectedProject.modules?.indexOf('CI') > -1) || false
  const isCIModule = module === 'ci'
  const searchRef = useRef<ExpandingSearchInputHandle>({} as ExpandingSearchInputHandle)
  const { NG_NATIVE_HELM } = useFeatureFlags()

  const goToPipelineDetail = useCallback(
    (/* istanbul ignore next */ pipeline?: PMSPipelineSummaryResponse) => {
      history.push(
        routes.toPipelineDeploymentList({
          projectIdentifier,
          orgIdentifier,
          pipelineIdentifier: pipeline?.identifier || '-1',
          accountId,
          module,
          branch: pipeline?.gitDetails?.branch,
          repoIdentifier: pipeline?.gitDetails?.repoIdentifier
        })
      )
    },
    [projectIdentifier, orgIdentifier, history, accountId]
  )

  const goToPipeline = useCallback(
    (pipeline?: PMSPipelineSummaryResponse) => {
      history.push(
        routes.toPipelineStudio({
          projectIdentifier,
          orgIdentifier,
          pipelineIdentifier: pipeline?.identifier || '-1',
          accountId,
          module,
          branch: pipeline?.gitDetails?.branch,
          repoIdentifier: pipeline?.gitDetails?.repoIdentifier
        })
      )
    },
    [projectIdentifier, orgIdentifier, history, accountId]
  )

  const defaultQueryParamsForPiplines = {
    accountIdentifier: accountId,
    projectIdentifier,
    module,
    orgIdentifier,
    searchTerm: searchParam,
    page,
    sort,
    size: 20,
    ...(gitFilter?.repo &&
      gitFilter.branch && {
        repoIdentifier: gitFilter.repo,
        branch: gitFilter.branch
      })
  }

  const { mutate: reloadPipelines, cancel } = useGetPipelineList({
    queryParams: defaultQueryParamsForPiplines,
    queryParamStringifyOptions: { arrayFormat: 'comma' },
    mock: mockData
  })

  const { mutate: deletePipeline } = useSoftDeletePipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const fetchPipelines = useCallback(
    async (params?: GetPipelineListQueryParams, formData?: PipelineFilterProperties): Promise<void> => {
      try {
        cancel()
        setError(null)
        const filter = Object.assign(
          {
            filterType: 'PipelineSetup'
          },
          isObjectEmpty(formData || {}) ? appliedFilter?.filterProperties : formData
        ) as PipelineFilterProperties
        const { status, data } = await reloadPipelines(filter, { queryParams: params })
        if (status === 'SUCCESS') {
          setPipelineList(data)
        }
      } catch (e) {
        if (shouldShowError(e)) {
          showError(e.data?.message || e.message, undefined, 'pipeline.fetch.pipeline.error')
          setError(e)
        }
      }
      setIsLoading(false)
      setIsReseting(false)
    },
    [reloadPipelines, showError, cancel, appliedFilter]
  )

  useDocumentTitle([getString('pipelines')])

  const reset = (): void => {
    searchRef.current.clear()
    setAppliedFilter(null)
    setGitFilter(null)
    setError(null)
    setSearchParam('')
    setIsReseting(true)
  }

  /* #region FIlter CRUD operations */
  const defaultQueryParamsForFilters: GetFilterListQueryParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    type: 'PipelineSetup'
  }

  const {
    loading: isFetchingFilters,
    data: fetchedFilterResponse,
    error: errorFetchingFilters,
    refetch: refetchFilterList
  } = useGetFilterList({
    queryParams: defaultQueryParamsForFilters
  })
  if (errorFetchingFilters && shouldShowError(errorFetchingFilters)) {
    showError(errorFetchingFilters?.data || errorFetchingFilters?.message, undefined, 'pipeline.fetch.filter.error')
  }

  useEffect(() => {
    trackEvent(NavigatedToPage.PipelinesPage, {})
  }, [])

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
    // eslint-disable-next-line @typescript-eslint/no-shadow
    data: FilterDataInterface<PipelineFormType, FilterInterface>
  ): Promise<void> => {
    setIsRefreshingFilters(true)
    const requestBodyPayload = createRequestBodyPayload({
      isUpdate,
      data,
      projectIdentifier,
      orgIdentifier
    })
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

  const { data: deploymentTypeResponse, loading: isFetchingDeploymentTypes } = useGetServiceDefinitionTypes({})
  const [deploymentTypeSelectOptions, setDeploymentTypeSelectOptions] = React.useState<SelectOption[]>([])

  React.useEffect(() => {
    if (!isEmpty(deploymentTypeResponse?.data) && deploymentTypeResponse?.data) {
      const options: SelectOption[] = deploymentTypeResponse.data.map(type => ({
        label: type === 'NativeHelm' ? getString('pipeline.nativeHelm') : getString('kubernetesText'),
        value: type as string
      }))
      setDeploymentTypeSelectOptions(options)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentTypeResponse?.data])

  const {
    data: servicesResponse,
    loading: isFetchingServices,
    refetch: fetchServices
  } = useGetServiceListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })

  const {
    data: environmentsResponse,
    loading: isFetchingEnvironments,
    refetch: fetchEnvironments
  } = useGetEnvironmentListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })

  useEffect(() => {
    fetchServices()
    fetchEnvironments()
  }, [projectIdentifier])

  useEffect(() => {
    setIsFetchingMetaData(isFetchingDeploymentTypes && isFetchingServices && isFetchingEnvironments)
  }, [isFetchingDeploymentTypes, isFetchingServices, isFetchingEnvironments])

  const [openFilterDrawer, hideFilterDrawer] = useModalHook(() => {
    const onApply = (inputFormData: FormikProps<PipelineFormType>['values']) => {
      if (!isObjectEmpty(inputFormData)) {
        const filterFromFormData = getValidFilterArguments({ ...inputFormData })
        setAppliedFilter({ ...unsavedFilter, filterProperties: filterFromFormData || {} })
        hideFilterDrawer()
      } else {
        showError(getString('filters.invalidCriteria'), undefined, 'pipeline.invalid.criteria.error')
      }
    }

    const handleFilterClick = (identifier: string): void => {
      if (identifier !== unsavedFilter.identifier) {
        const selectedFilter = getFilterByIdentifier(identifier, filters)
        setAppliedFilter(selectedFilter)
      }
    }

    const {
      name: pipelineName,
      pipelineTags: _pipelineTags,
      moduleProperties,
      description
    } = (appliedFilter?.filterProperties as PipelineFilterProperties) || {}
    const { name = '', filterVisibility, identifier = '' } = appliedFilter || {}
    const { ci, cd } = moduleProperties || {}
    const { branch, tag, ciExecutionInfoDTO, repoName } = ci || {}
    const { deploymentTypes, environmentNames, infrastructureTypes, serviceNames } = cd || {}
    const { sourceBranch, targetBranch } = ciExecutionInfoDTO?.pullRequest || {}
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const buildType = getBuildType(moduleProperties || {})

    return isFetchingFilters && isFetchingMetaData ? (
      <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
        <OverlaySpinner show={true} className={css.loading}>
          <></>
        </OverlaySpinner>
      </div>
    ) : (
      <Filter<PipelineFormType, FilterDTO>
        formFields={
          <PipelineFilterForm<PipelineFormType>
            isCDEnabled={isCDEnabled}
            isCIEnabled={isCIEnabled}
            initialValues={{
              environments: getMultiSelectFormOptions(environmentsResponse?.data?.content),
              services: getMultiSelectFormOptions(servicesResponse?.data?.content),
              deploymentType: NG_NATIVE_HELM
                ? deploymentTypeSelectOptions
                : deploymentTypeSelectOptions.filter(deploymentType => deploymentType.value !== 'NativeHelm')
            }}
            type="PipelineSetup"
          />
        }
        initialFilter={{
          formValues: {
            name: pipelineName,
            pipelineTags: _pipelineTags?.reduce((obj, item) => Object.assign(obj, { [item.key]: item.value }), {}),
            description,
            branch,
            tag,
            sourceBranch,
            targetBranch,
            buildType,
            repositoryName: repoName ? repoName[0] : undefined,
            deploymentType: deploymentTypes,
            infrastructureType: infrastructureTypes ? infrastructureTypes[0] : undefined,
            services: getMultiSelectFormOptions(serviceNames),
            environments: getMultiSelectFormOptions(environmentNames)
          },
          metadata: { name, filterVisibility, identifier, filterProperties: {} }
        }}
        filters={filters}
        isRefreshingFilters={isRefreshingFilters || isFetchingMetaData}
        onApply={onApply}
        onClose={() => hideFilterDrawer()}
        onSaveOrUpdate={handleSaveOrUpdate}
        onDelete={handleDelete}
        onFilterSelect={handleFilterClick}
        onClear={reset}
        ref={filterRef}
        dataSvcConfig={
          new Map<CrudOperation, (...rest: any[]) => Promise<any>>([
            ['ADD', createFilter],
            ['UPDATE', updateFilter],
            ['DELETE', deleteFilter]
          ])
        }
        onSuccessfulCrudOperation={refetchFilterList}
      />
    )
  }, [
    isRefreshingFilters,
    appliedFilter,
    filters,
    module,
    environmentsResponse?.data?.content,
    servicesResponse?.data?.content
  ])

  /* #region Filter Selection */

  const handleFilterSelection = (
    option: SelectOption,
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ): void => {
    event?.stopPropagation()
    event?.preventDefault()
    /* istanbul ignore else */
    if (option.value) {
      const selectedFilter = getFilterByIdentifier(option.value?.toString(), filters)
      const aggregatedFilter = selectedFilter?.filterProperties || {}
      const combinedFilter = Object.assign(selectedFilter, { filterProperties: aggregatedFilter })
      setAppliedFilter(combinedFilter)
    } else {
      reset()
    }
  }

  const fieldToLabelMapping = new Map<string, string>()
  fieldToLabelMapping.set('name', getString('name'))
  fieldToLabelMapping.set('description', getString('description'))
  fieldToLabelMapping.set('pipelineTags', getString('tagsLabel'))
  fieldToLabelMapping.set('sourceBranch', getString('pipeline.triggers.conditionsPanel.sourceBranch'))
  fieldToLabelMapping.set('targetBranch', getString('pipeline.triggers.conditionsPanel.targetBranch'))
  fieldToLabelMapping.set('branch', getString('pipelineSteps.deploy.inputSet.branch'))
  fieldToLabelMapping.set('tag', getString('tagLabel'))
  fieldToLabelMapping.set('repoNames', getString('common.repositoryName'))
  fieldToLabelMapping.set('buildType', getString('filters.executions.buildType'))
  fieldToLabelMapping.set('deploymentTypes', getString('deploymentTypeText'))
  fieldToLabelMapping.set('infrastructureTypes', getString('infrastructureTypeText'))
  fieldToLabelMapping.set('serviceNames', getString('services'))
  fieldToLabelMapping.set('environmentNames', getString('environments'))

  const filterWithValidFields = removeNullAndEmpty(
    pick(flattenObject(appliedFilter?.filterProperties || {}), ...fieldToLabelMapping.keys())
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

  useEffect(() => {
    cancel()
    setIsLoading(true)
    fetchPipelines(defaultQueryParamsForPiplines, appliedFilter?.filterProperties)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    accountId,
    projectIdentifier,
    orgIdentifier,
    appliedFilter?.filterProperties,
    module,
    searchParam,
    sort,
    gitFilter
  ])

  const shouldRenderFilterSelector = (): boolean => {
    if (isGitSyncEnabled) {
      if (pipelineList?.content?.length) {
        return true
      }
      if (appliedFilter || searchParam) {
        return true
      }
      return false
    }
    return true
  }

  const onDeletePipeline = async (commitMsg: string): Promise<void> => {
    try {
      setIsDeleting(true)
      const gitParams = pipelineToDelete?.gitDetails?.objectId
        ? {
            ...pick(pipelineToDelete?.gitDetails, ['branch', 'repoIdentifier', 'filePath', 'rootFolder']),
            commitMsg,
            lastObjectId: pipelineToDelete?.gitDetails?.objectId
          }
        : {}

      const deleted = await deletePipeline(defaultTo(pipelineToDelete?.identifier, ''), {
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          ...gitParams
        },
        headers: { 'content-type': 'application/json' }
      })
      setIsDeleting(false)

      /* istanbul ignore else */
      if (deleted?.status === 'SUCCESS') {
        showSuccess(getString('pipeline-list.pipelineDeleted', { name: pipelineToDelete?.name }))
      } else {
        throw getString('somethingWentWrong')
      }
      fetchPipelines()
    } catch (err) {
      setIsDeleting(false)
      /* istanbul ignore next */
      showError(err?.data?.message || err?.message, undefined, 'pipeline.delete.pipeline.error')
    }
  }

  if (isDeleting) {
    return <PageSpinner />
  }

  return (
    <>
      <Page.Header
        title={
          <div className="ng-tooltip-native">
            <h2 data-tooltip-id="pipelinesPageHeading"> {getString('pipelines')}</h2>
            <HarnessDocTooltip tooltipId="pipelinesPageHeading" useStandAlone={true} />
          </div>
        }
        breadcrumbs={<NGBreadcrumbs links={[]} />}
      ></Page.Header>
      <PipelineFeatureLimitBreachedBanner featureIdentifier={FeatureIdentifier.SERVICES} module={module} />
      <PipelineFeatureLimitBreachedBanner featureIdentifier={FeatureIdentifier.DEPLOYMENTS_PER_MONTH} module={module} />
      <PipelineFeatureLimitBreachedBanner featureIdentifier={FeatureIdentifier.INITIAL_DEPLOYMENTS} module={module} />
      {(isReseting || !!pipelineList?.content?.length || appliedFilter || isGitSyncEnabled || searchParam) && (
        <Page.SubHeader>
          <Layout.Horizontal>
            <RbacButton
              variation={ButtonVariation.PRIMARY}
              data-testid="add-pipeline"
              icon="plus"
              text={getString('pipeline.newPipelineText')}
              onClick={() => goToPipeline()}
              tooltipProps={{
                dataTooltipId: 'addPipeline'
              }}
              permission={{
                permission: PermissionIdentifier.EDIT_PIPELINE,
                resource: {
                  resourceType: ResourceType.PIPELINE
                }
              }}
            />
            {isGitSyncEnabled && (
              <GitSyncStoreProvider>
                <GitFilters
                  onChange={filter => {
                    setGitFilter(filter)
                    setPage(0)
                  }}
                  className={css.gitFilter}
                  defaultValue={gitFilter || undefined}
                />
              </GitSyncStoreProvider>
            )}
          </Layout.Horizontal>
          <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
            <>
              <ExpandingSearchInput
                alwaysExpanded
                width={200}
                placeholder={getString('search')}
                onChange={(text: string) => {
                  setIsReseting(true)
                  setSearchParam(text)
                }}
                ref={searchRef}
                className={css.expandSearch}
              />
              {shouldRenderFilterSelector() && (
                <Layout.Horizontal padding={{ left: 'small', right: 'small' }}>
                  <FilterSelector<FilterDTO>
                    appliedFilter={appliedFilter}
                    filters={filters}
                    onFilterBtnClick={openFilterDrawer}
                    onFilterSelect={handleFilterSelection}
                    fieldToLabelMapping={fieldToLabelMapping}
                    filterWithValidFields={filterWithValidFieldsWithMetaInfo}
                  />
                </Layout.Horizontal>
              )}
            </>
            <GridListToggle initialSelectedView={Views.GRID} onViewToggle={setView} />
          </Layout.Horizontal>
        </Page.SubHeader>
      )}
      <Page.Body
        className={css.pageBody}
        error={error?.message}
        retryOnError={/* istanbul ignore next */ () => fetchPipelines()}
      >
        {!!pipelineList?.content?.length && (
          <Layout.Horizontal
            spacing="large"
            margin={{ left: 'large', top: 'large', bottom: 'large', right: 'large' }}
            className={css.topHeaderFields}
          >
            <Text color={Color.GREY_800} iconProps={{ size: 14 }}>
              {getString('total')}: {pipelineList?.totalElements}
            </Text>
            <DropDown
              items={sortOptions}
              value={selectedSort.value.toString()}
              filterable={false}
              width={180}
              icon={'main-sort'}
              iconProps={{ size: 16, color: Color.GREY_400 }}
              onChange={item => {
                if (item.value === SortFields.AZ09) {
                  setStort([SortFields.Name, Sort.ASC])
                } else if (item.value === SortFields.ZA90) {
                  setStort([SortFields.Name, Sort.DESC])
                } else if (item.value === SortFields.LastUpdatedAt) {
                  setStort([SortFields.LastUpdatedAt, Sort.DESC])
                } else if (item.value === SortFields.RecentActivity) {
                  setStort([SortFields.RecentActivity, Sort.DESC])
                }
                setPage(0)
                setSelectedSort(item)
              }}
            />
          </Layout.Horizontal>
        )}
        {isLoading ? (
          <PageSpinner />
        ) : !pipelineList?.content?.length ? (
          <div className={css.noPipelineSection}>
            {appliedFilter || searchParam ? (
              <Layout.Vertical spacing="small" flex>
                <Icon size={50} name={isCIModule ? 'ci-main' : 'cd-main'} margin={{ bottom: 'large' }} />
                <Text
                  margin={{ top: 'large', bottom: 'small' }}
                  font={{ weight: 'bold', size: 'medium' }}
                  color={Color.GREY_800}
                >
                  {getString('common.filters.noMatchingFilterData')}
                </Text>
                <String stringID="common.filters.clearFilters" className={css.clearFilterText} onClick={reset} />
              </Layout.Vertical>
            ) : (
              <Layout.Vertical spacing="small" flex={{ justifyContent: 'center', alignItems: 'center' }} width={720}>
                <img src={pipelineIllustration} className={css.image} />

                <Text className={css.noPipelineText} margin={{ top: 'medium', bottom: 'small' }}>
                  {getString('pipeline.noPipelineText')}
                </Text>
                <Text className={css.aboutPipeline} margin={{ top: 'xsmall', bottom: 'xlarge' }}>
                  {getString('pipeline-list.aboutPipeline')}
                </Text>

                <RbacButton
                  variation={ButtonVariation.PRIMARY}
                  onClick={() => goToPipeline()}
                  text={getString('common.createPipeline')}
                  permission={{
                    permission: PermissionIdentifier.EDIT_PIPELINE,
                    resource: {
                      resourceType: ResourceType.PIPELINE
                    },
                    resourceScope: {
                      accountIdentifier: accountId,
                      orgIdentifier,
                      projectIdentifier
                    }
                  }}
                />
              </Layout.Vertical>
            )}
          </div>
        ) : (
          <GitSyncStoreProvider>
            {view === Views.GRID ? (
              <PipelineGridView
                gotoPage={/* istanbul ignore next */ pageNumber => setPage(pageNumber)}
                data={pipelineList}
                goToPipelineDetail={goToPipelineDetail}
                goToPipelineStudio={goToPipeline}
                refetchPipeline={fetchPipelines}
                onDeletePipeline={onDeletePipeline}
                onDelete={(pipeline: PMSPipelineSummaryResponse) => {
                  setPipelineToDelete(pipeline)
                }}
              />
            ) : (
              <PipelineListView
                gotoPage={/* istanbul ignore next */ pageNumber => setPage(pageNumber)}
                data={pipelineList}
                goToPipelineDetail={goToPipelineDetail}
                goToPipelineStudio={goToPipeline}
                refetchPipeline={fetchPipelines}
                onDelete={(pipeline: PMSPipelineSummaryResponse) => {
                  setPipelineToDelete(pipeline)
                }}
                onDeletePipeline={onDeletePipeline}
              />
            )}
          </GitSyncStoreProvider>
        )}
      </Page.Body>
    </>
  )
}

export default PipelinesPage
