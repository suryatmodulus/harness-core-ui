import React, { useState, useEffect, useCallback } from 'react'
import {
  Layout,
  useModalHook,
  SelectOption,
  FormInput,
  MultiSelectOption,
  ExpandingSearchInput,
  Container
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { debounce, noop, pick } from 'lodash-es'
import type { FormikErrors } from 'formik'
import {
  useGetConnectorListV2,
  ResponsePageConnectorResponse,
  useGetConnectorCatalogue,
  ConnectorCatalogueItem,
  ResponseConnectorCatalogueResponse,
  useGetConnectorStatistics,
  useGetFilterList,
  FilterDTO,
  usePostFilter,
  useUpdateFilter,
  useDeleteFilter,
  ResponsePageFilterDTO,
  ResponseConnectorStatistics,
  GetConnectorListV2QueryParams
} from 'services/cd-ng'
import type { ConnectorFilterProperties } from 'services/cd-ng'
import type { UseGetMockData } from '@common/utils/testUtils'
import { useToaster, StringUtils } from '@common/exports'
import { AddDrawer, PageSpinner } from '@common/components'
import {
  AddDrawerMapInterface,
  DrawerContext,
  CategoryInterface,
  ItemInterface
} from '@common/components/AddDrawer/AddDrawer'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import {
  removeNullAndEmpty,
  isObjectEmpty,
  UNSAVED_FILTER,
  flattenObject
} from '@common/components/Filter/utils/FilterUtils'
import { useStrings } from 'framework/strings'
import type { FilterInterface, FilterDataInterface } from '@common/components/Filter/Constants'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import { shouldShowError } from '@common/utils/errorUtils'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

import {
  createRequestBodyPayload,
  ConnectorFormType,
  getValidFilterArguments,
  renderItemByType,
  getAggregatedConnectorFilter,
  ConnectorStatCategories,
  getOptionsForMultiSelect,
  validateForm
} from './utils/RequestUtils'
import css from './FeatureFlagsFilter.module.scss'

interface FeatureFlagsListProps {
  mockData?: UseGetMockData<ResponsePageConnectorResponse>
  catalogueMockData?: UseGetMockData<ResponseConnectorCatalogueResponse>
  statisticsMockData?: UseGetMockData<ResponseConnectorStatistics>
  filtersMockData?: UseGetMockData<ResponsePageFilterDTO>
}

const FeatureFlagsFilter: React.FC<FeatureFlagsListProps> = ({
  catalogueMockData,
  statisticsMockData,
  filtersMockData
}) => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<FilterDTO[]>()
  const [appliedFilter, setAppliedFilter] = useState<FilterDTO | null>()
  const { showError } = useToaster()
  const [isRefreshingFilters, setIsRefreshingFilters] = useState<boolean>(false)
  const [isFetchingStats, setIsFetchingStats] = useState<boolean>(false)
  const filterRef = React.useRef<FilterRef<FilterDTO> | null>(null)
  const [shouldApplyGitFilters, setShouldApplyGitFilters] = useState<boolean>()
  const [queryParamsWithGitContext, setQueryParamsWithGitContext] = useState<GetConnectorListV2QueryParams>({})
  const defaultQueryParams: GetConnectorListV2QueryParams = {
    pageIndex: page,
    pageSize: 10,
    projectIdentifier,
    orgIdentifier,
    accountIdentifier: accountId,
    searchTerm: ''
  }

  const ConnectorCatalogueNames = new Map<ConnectorCatalogueItem['category'], string>()
  // This list will control which categories will be displayed in UI and its order
  const connectorCatalogueOrder: Array<ConnectorCatalogueItem['category']> = [
    'CLOUD_PROVIDER',
    'ARTIFACTORY',
    'CODE_REPO',
    'TICKETING',
    'MONITORING',
    'SECRET_MANAGER'
  ]

  ConnectorCatalogueNames.set('CLOUD_PROVIDER', getString('cloudProviders'))
  ConnectorCatalogueNames.set('ARTIFACTORY', getString('artifactRepositories'))
  ConnectorCatalogueNames.set('CODE_REPO', getString('codeRepositories'))
  ConnectorCatalogueNames.set('TICKETING', getString('ticketingSystems'))
  ConnectorCatalogueNames.set('MONITORING', getString('monitoringAndLoggingSystems'))
  ConnectorCatalogueNames.set('SECRET_MANAGER', getString('secretManagers'))
  ConnectorCatalogueNames.set('CLOUD_COST', getString('cloudCostsText'))

  /* Clearing filter from Connector Filter Panel */
  const reset = (): void => {
    console.log('RESET')
  }

  /* #endregion */

  /* #region Create Connector Catalogue section */

  const computeDrawerMap = (catalogueData: ResponseConnectorCatalogueResponse | null): AddDrawerMapInterface => {
    const originalData = catalogueData?.data?.catalogue || []
    originalData.map(value => {
      value.category == 'SECRET_MANAGER' ? (value.connectors = ['Vault', 'AwsKms', 'AzureKeyVault']) : null
    })
    const orderedCatalogue: ConnectorCatalogueItem[] | { category: string; connectors: string[] } = []
    connectorCatalogueOrder.forEach(catalogueItem => {
      const catalogueEntry = originalData.find(item => item['category'] === catalogueItem)
      if (catalogueEntry) {
        orderedCatalogue.push(catalogueEntry)
      }
    })

    return Object.assign(
      {},
      {
        drawerLabel: 'Connectors',
        categories:
          orderedCatalogue.map((item: ConnectorCatalogueItem) => {
            return {
              categoryLabel: ConnectorCatalogueNames.get(item['category']) || '',
              items:
                item.connectors
                  ?.sort((a, b) => (a < b ? -1 : 1)) // TODO: lowerCase(name)
                  .map(entry => {
                    const name = entry.valueOf() || ''
                    return {
                      itemLabel: name || 'FOOBAR1',
                      iconName: 'edit', // TODO: ICON?
                      value: name
                    }
                  }) || []
            } as CategoryInterface
          }) || []
      }
    )
  }

  const { data: catalogueData, loading: loadingCatalogue } = useGetConnectorCatalogue({
    queryParams: { accountIdentifier: accountId },
    mock: catalogueMockData
  })

  const { loading: isFetchingConnectorStats, data: metaData, refetch: fetchConnectorStats } = useGetConnectorStatistics(
    {
      queryParams: shouldApplyGitFilters ? queryParamsWithGitContext : defaultQueryParams,
      mock: statisticsMockData
    }
  )

  useEffect(() => {
    setIsFetchingStats(isFetchingConnectorStats)
  }, [isFetchingConnectorStats])

  const [openDrawer, hideDrawer] = useModalHook(() => {
    const onSelect = (val: ItemInterface): void => {
      hideDrawer()
    }

    return loadingCatalogue ? (
      <PageSpinner />
    ) : (
      <AddDrawer
        addDrawerMap={computeDrawerMap(catalogueData)}
        onSelect={onSelect}
        onClose={hideDrawer}
        drawerContext={DrawerContext.PAGE}
        showRecentlyUsed={false}
      />
    )
  }, [catalogueData])

  const FilterForm = (): React.ReactElement => {
    return (
      <>
        <FormInput.MultiSelect
          items={getOptionsForMultiSelect(ConnectorStatCategories.TYPE, metaData || {})}
          name="types"
          label={getString('typeLabel')}
          key="types"
          multiSelectProps={{
            allowCreatingNewItems: false
          }}
        />
        <FormInput.KVTagInput name="tags" label={getString('tagsLabel')} key="tags" />
        <FormInput.MultiSelect
          items={getOptionsForMultiSelect(ConnectorStatCategories.STATUS, metaData || {})}
          name="connectivityStatuses"
          label={getString('connectivityStatus')}
          key="connectivityStatuses"
          multiSelectProps={{
            allowCreatingNewItems: false
          }}
        />
        <FormInput.Text name={'connectorNames'} label={getString('connectors.name')} key={'connectorNames'} />
        <FormInput.Text name={'connectorIdentifiers'} label={getString('identifier')} key={'connectorIdentifiers'} />
        <FormInput.Text name={'description'} label={getString('description')} key={'description'} />
      </>
    )
  }

  const { loading: isFetchingFilters, data: fetchedFilterResponse, refetch: refetchFilterList } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      type: 'Connector'
    },
    mock: filtersMockData
  })

  useEffect(() => {
    setFilters(fetchedFilterResponse?.data?.content || [])
    setIsRefreshingFilters(isFetchingFilters)
  }, [fetchedFilterResponse])

  const { mutate: createFilter } = usePostFilter({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: updateFilter } = useUpdateFilter({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: deleteFilter } = useDeleteFilter({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      type: 'Connector'
    }
  })

  const getFilterByIdentifier = (identifier: string): FilterDTO | undefined =>
    /* istanbul ignore if */
    filters?.find((filter: FilterDTO) => filter.identifier?.toLowerCase() === identifier.toLowerCase())

  const getMultiSelectFormOptions = (values?: any[]): SelectOption[] | undefined => {
    /* istanbul ignore if */
    return values?.map(item => {
      return { label: item, value: item }
    })
  }

  const handleSaveOrUpdate = async (
    isUpdate: boolean,
    data: FilterDataInterface<ConnectorFormType, FilterInterface>
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

  const unsavedFilter = {
    name: UNSAVED_FILTER,
    identifier: StringUtils.getIdentifierFromName(UNSAVED_FILTER)
  }

  const handleFilterClick = (identifier: string): void => {
    if (identifier !== unsavedFilter.identifier) {
      setAppliedFilter(getFilterByIdentifier(identifier))
    }
  }

  const typeMultiSelectValues = getOptionsForMultiSelect(ConnectorStatCategories.TYPE, metaData || {})?.map(
    option => option.value
  ) as string[]
  const connectivityStatusMultiValues = getOptionsForMultiSelect(ConnectorStatCategories.STATUS, metaData || {})?.map(
    option => option.value
  ) as string[]

  const [openFilterDrawer, hideFilterDrawer] = useModalHook(() => {
    const onFilterApply = (formData: Record<string, any>) => {
      if (!isObjectEmpty(formData)) {
        const filterFromFormData = getValidFilterArguments({ ...formData })
        const aggregatedFilter = getAggregatedConnectorFilter(searchTerm, { ...filterFromFormData })
        const updatedQueryParams = {
          ...(shouldApplyGitFilters ? queryParamsWithGitContext : defaultQueryParams),
          searchTerm,
          pageIndex: 0
        }
        // refetchConnectorList(updatedQueryParams, aggregatedFilter, false)
        setAppliedFilter({ ...unsavedFilter, filterProperties: aggregatedFilter || {} })
        setPage(0)
        hideFilterDrawer()
      } else {
        showError(getString('filters.invalidCriteria'))
      }
    }

    const { connectorNames, connectorIdentifiers, description, types, connectivityStatuses, tags } =
      (appliedFilter?.filterProperties as ConnectorFilterProperties) || {}
    const { name = '', filterVisibility } = appliedFilter || {}
    return isFetchingStats ? (
      <PageSpinner />
    ) : (
      <Filter<ConnectorFormType, FilterDTO>
        onApply={onFilterApply}
        onClose={() => {
          hideFilterDrawer()
          refetchFilterList()
        }}
        filters={filters}
        initialFilter={{
          formValues: {
            connectorNames,
            connectorIdentifiers,
            description,
            types: getMultiSelectFormOptions(types),
            connectivityStatuses: getMultiSelectFormOptions(connectivityStatuses),
            tags
          },
          metadata: {
            name,
            filterVisibility: filterVisibility,
            identifier: appliedFilter?.identifier || '',
            filterProperties: {}
          }
        }}
        onSaveOrUpdate={handleSaveOrUpdate}
        onDelete={handleDelete}
        onFilterSelect={handleFilterClick}
        isRefreshingFilters={isRefreshingFilters || isFetchingStats}
        formFields={<FilterForm />}
        onValidate={(values: Partial<ConnectorFormType>): FormikErrors<Partial<ConnectorFormType>> => {
          const errors: FormikErrors<{ types?: MultiSelectOption[]; connectivityStatuses?: MultiSelectOption[] }> = {}
          const { typeErrors, connectivityStatusErrors } = validateForm(
            values,
            typeMultiSelectValues,
            connectivityStatusMultiValues,
            metaData || {}
          )
          if (typeErrors?.size > 0) {
            errors.types = getString('filters.invalidSelection') + ': ' + renderItemByType(Array.from(typeErrors))
          }
          if (connectivityStatusErrors?.size > 0) {
            errors.connectivityStatuses =
              getString('filters.invalidSelection') + ': ' + renderItemByType(Array.from(connectivityStatusErrors))
          }
          return errors
        }}
        dataSvcConfig={
          new Map<CrudOperation, (...rest: any[]) => Promise<any>>([
            ['ADD', createFilter],
            ['UPDATE', updateFilter],
            ['DELETE', deleteFilter]
          ])
        }
        onSuccessfulCrudOperation={refetchFilterList}
        ref={filterRef}
        onClear={reset}
      />
    )
  }, [isRefreshingFilters, filters, appliedFilter, isFetchingStats, searchTerm])

  const handleFilterSelection = (
    option: SelectOption,
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ): void => {
    event?.stopPropagation()
    event?.preventDefault()
    /* istanbul ignore else */
    if (option.value) {
      const selectedFilter = getFilterByIdentifier(option.value?.toString())
      const aggregatedFilter = getAggregatedConnectorFilter(searchTerm, selectedFilter?.filterProperties || {})
      const combinedFilter = Object.assign(selectedFilter, { filterProperties: aggregatedFilter })
      setAppliedFilter(combinedFilter)

      console.log('handle filter selection')
    } else {
      reset()
    }
  }

  const fieldToLabelMapping = new Map<string, string>()
  fieldToLabelMapping.set('connectorNames', getString('connectors.name'))
  fieldToLabelMapping.set('connectorIdentifiers', getString('identifier'))
  fieldToLabelMapping.set('description', getString('description'))
  fieldToLabelMapping.set('types', getString('typeLabel'))
  fieldToLabelMapping.set('tags', getString('tagsLabel'))
  fieldToLabelMapping.set('connectivityStatuses', getString('connectivityStatus'))

  return (
    <Layout.Horizontal margin={{ left: 'small' }}>
      <Container className={css.expandSearch} margin={{ right: 'small' }} data-name="connectorSeachContainer">
        <ExpandingSearchInput
          placeholder={getString('search')}
          throttle={200}
          onChange={(query: string) => {
            // debouncedConnectorSearch(encodeURIComponent(query))
            console.log('SEARCH')
            setSearchTerm(query)
          }}
        />
      </Container>
      <FilterSelector<FilterDTO>
        appliedFilter={appliedFilter}
        filters={filters}
        onFilterBtnClick={openFilterDrawer}
        onFilterSelect={handleFilterSelection}
        fieldToLabelMapping={fieldToLabelMapping}
        filterWithValidFields={removeNullAndEmpty(
          pick(flattenObject(appliedFilter?.filterProperties || {}), ...fieldToLabelMapping.keys())
        )}
      />
    </Layout.Horizontal>
  )
}

export default FeatureFlagsFilter
