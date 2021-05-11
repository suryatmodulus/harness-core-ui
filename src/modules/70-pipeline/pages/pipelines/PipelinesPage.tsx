import React, { useEffect, useState } from 'react'
import {
  Button,
  Color,
  ExpandingSearchInput,
  Icon,
  Layout,
  OverlaySpinner,
  Select,
  SelectOption,
  Text,
  useModalHook
} from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { pick } from 'lodash-es'
import { Page, StringUtils, useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'
import {
  FilterDTO,
  GetFilterListQueryParams,
  GetPipelineListQueryParams,
  PagePMSPipelineSummaryResponse,
  PipelineFilterProperties,
  ResponsePagePMSPipelineSummaryResponse,
  useDeleteFilter,
  useGetFilterList,
  useGetPipelineList,
  usePostFilter,
  useUpdateFilter
} from 'services/pipeline-ng'
import { useGetServiceListForProject, useGetEnvironmentListForProject } from 'services/cd-ng'
import type { UseGetMockData } from '@common/utils/testUtils'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
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
import { shouldShowError } from '@common/utils/errorUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { PipelineGridView } from './views/PipelineGridView'
import { PipelineListView } from './views/PipelineListView'
import PipelineFilterForm from '../pipeline-deployment-list/PipelineFilterForm/PipelineFilterForm'

import css from './PipelinesPage.module.scss'

export enum Views {
  LIST,
  GRID
}

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
  const { isGitSyncEnabled } = useAppStore()
  const [initLoading, setInitLoading] = React.useState(true)
  const [appliedFilter, setAppliedFilter] = useState<FilterDTO | null>()
  const [filters, setFilters] = useState<FilterDTO[]>()
  const [isRefreshingFilters, setIsRefreshingFilters] = useState<boolean>(false)
  const filterRef = React.useRef<FilterRef<FilterDTO> | null>(null)
  const [gitFilter, setGitFilter] = useState<GitFilterScope>({ repo: '', branch: '' })
  const [error, setError] = useState<Error | null>(null)
  const history = useHistory()
  const { showError } = useToaster()
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    }>
  >()
  const [isFetchingMetaData, setIsFetchingMetaData] = useState<boolean>(false)

  const { selectedProject } = useAppStore()
  const project = selectedProject
  const isCDEnabled = (selectedProject?.modules && selectedProject.modules?.indexOf('CD') > -1) || false
  const isCIEnabled = (selectedProject?.modules && selectedProject.modules?.indexOf('CI') > -1) || false

  const goToPipelineDetail = React.useCallback(
    (/* istanbul ignore next */ pipelineIdentifier = '-1') => {
      history.push(
        routes.toPipelineDeploymentList({
          projectIdentifier,
          orgIdentifier,
          pipelineIdentifier,
          accountId,
          module
        })
      )
    },
    [projectIdentifier, orgIdentifier, history, accountId]
  )

  const goToPipeline = React.useCallback(
    (pipelineIdentifier = '-1') => {
      history.push(
        routes.toPipelineStudio({
          projectIdentifier,
          orgIdentifier,
          pipelineIdentifier,
          accountId,
          module
        })
      )
    },
    [projectIdentifier, orgIdentifier, history, accountId]
  )
  const [page, setPage] = React.useState(0)
  const [view, setView] = React.useState<Views>(Views.GRID)
  const { getString } = useStrings()
  const [sort, setStort] = React.useState<string[]>([SortFields.LastUpdatedAt, Sort.DESC])

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
  // Set Default to LastUpdated
  const [selectedSort, setSelectedSort] = React.useState<SelectOption>(sortOptions[1])

  const [searchParam, setSearchParam] = React.useState('')
  const [pipelineList, setPipelineList] = React.useState<PagePMSPipelineSummaryResponse | undefined>()
  const defaultQueryParamsForPiplines = {
    accountIdentifier: accountId,
    projectIdentifier,
    module,
    orgIdentifier,
    searchTerm: searchParam,
    page,
    sort,
    size: 10
  }

  const { mutate: reloadPipelines, cancel } = useGetPipelineList({
    queryParams: defaultQueryParamsForPiplines,
    queryParamStringifyOptions: { arrayFormat: 'comma' },
    mock: mockData
  })

  const fetchPipelines = React.useCallback(
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
          showError(e.data?.message || e.message)
          setError(e)
        }
      }
      setInitLoading(false)
    },
    [reloadPipelines, showError, cancel, appliedFilter]
  )

  const reset = (): void => {
    setAppliedFilter(null)
    setError(null)
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
    showError(errorFetchingFilters?.data || errorFetchingFilters?.message)
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

  const { data: servicesResponse, loading: isFetchingServices, refetch: fetchServices } = useGetServiceListForProject({
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
    setIsFetchingMetaData(isFetchingServices && isFetchingEnvironments)
  }, [isFetchingServices, isFetchingEnvironments])

  const [openFilterDrawer, hideFilterDrawer] = useModalHook(() => {
    const onApply = (inputFormData: FormikProps<PipelineFormType>['values']) => {
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
        const selectedFilter = getFilterByIdentifier(identifier, filters)
        setAppliedFilter(selectedFilter)
      }
    }

    const { name: pipelineName, pipelineTags: _pipelineTags, moduleProperties, description } =
      (appliedFilter?.filterProperties as PipelineFilterProperties) || {}
    const { name = '', filterVisibility, identifier = '' } = appliedFilter || {}
    const { ci, cd } = moduleProperties || {}
    const { branch, tag, ciExecutionInfoDTO, repoNames } = ci || {}
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
              services: getMultiSelectFormOptions(servicesResponse?.data?.content)
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
            repositoryName: repoNames ? repoNames[0] : undefined,
            deploymentType: deploymentTypes ? deploymentTypes[0] : undefined,
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
  fieldToLabelMapping.set('repoNames', getString('pipelineSteps.build.create.repositoryNameLabel'))
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
    setInitLoading(true)
    fetchPipelines(
      {
        ...defaultQueryParamsForPiplines,
        ...(!!gitFilter.repo && {
          repoIdentifier: gitFilter.repo,
          branch: gitFilter.branch
        })
      },
      appliedFilter?.filterProperties
    )
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

  return (
    <>
      <Page.Header
        title={
          <Layout.Vertical spacing="xsmall">
            <Breadcrumbs
              links={[
                {
                  url: routes.toProjectOverview({
                    orgIdentifier,
                    projectIdentifier,
                    accountId,
                    module
                  }),
                  label: project?.name as string
                },
                { url: '#', label: getString('pipelines') }
              ]}
            />
            <Text font={{ size: 'medium' }} color={Color.GREY_700}>
              {getString('pipelines')}
            </Text>
          </Layout.Vertical>
        }
      />
      <Layout.Horizontal className={css.header} flex={{ distribution: 'space-between' }}>
        <Layout.Horizontal>
          <RbacButton
            intent="primary"
            data-testid="add-pipeline"
            text={getString('addPipeline')}
            onClick={() => goToPipeline()}
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
              />
            </GitSyncStoreProvider>
          )}
        </Layout.Horizontal>
        <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
          <>
            <div className={css.expandSearch}>
              <ExpandingSearchInput
                placeholder={getString('search')}
                throttle={200}
                onChange={(text: string) => {
                  setSearchParam(text)
                }}
              />
            </div>
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
          </>
          <Layout.Horizontal flex>
            <Button
              minimal
              icon="grid-view"
              intent={view === Views.GRID ? 'primary' : 'none'}
              onClick={() => {
                setView(Views.GRID)
              }}
            />
            <Button
              minimal
              icon="list"
              intent={view === Views.LIST ? 'primary' : 'none'}
              onClick={() => {
                setView(Views.LIST)
              }}
            />
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Page.Body
        className={css.pageBody}
        error={error?.message}
        retryOnError={/* istanbul ignore next */ () => fetchPipelines()}
      >
        <Layout.Horizontal
          spacing="large"
          margin={{ left: 'xxlarge', top: 'large', bottom: 'large', right: 'xxlarge' }}
          className={css.topHeaderFields}
        >
          <Text color={Color.GREY_800} iconProps={{ size: 14 }}>
            {getString('total')}: {pipelineList?.totalElements}
          </Text>
          <Select
            items={sortOptions}
            value={selectedSort}
            className={css.sortSelector}
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
        {initLoading ? (
          <OverlaySpinner show={true} className={css.loading}>
            <></>
          </OverlaySpinner>
        ) : !pipelineList?.content?.length ? (
          appliedFilter ? (
            <Text padding={{ top: 'small', bottom: 'small' }} className={css.noData} font="medium">
              {getString('filters.noDataFound')}
            </Text>
          ) : (
            <div className={css.noPipelineSection}>
              <div className={css.noPipelineData}>
                <Icon size={20} name="pipeline-ng"></Icon>
                <Text padding={{ top: 'small', bottom: 'small' }} font="medium">
                  {getString('pipeline-list.aboutPipeline')}
                </Text>

                <RbacButton
                  intent="primary"
                  onClick={() => goToPipeline()}
                  text={getString('pipeline-list.createPipeline')}
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
              </div>
            </div>
          )
        ) : view === Views.GRID ? (
          <PipelineGridView
            gotoPage={/* istanbul ignore next */ pageNumber => setPage(pageNumber)}
            data={pipelineList}
            goToPipelineDetail={goToPipelineDetail}
            goToPipelineStudio={goToPipeline}
            refetchPipeline={fetchPipelines}
          />
        ) : (
          <PipelineListView
            gotoPage={/* istanbul ignore next */ pageNumber => setPage(pageNumber)}
            data={pipelineList}
            goToPipelineDetail={goToPipelineDetail}
            goToPipelineStudio={goToPipeline}
            refetchPipeline={fetchPipelines}
          />
        )}
      </Page.Body>
    </>
  )
}

export default PipelinesPage
