import React, { useState, useEffect, useCallback } from 'react'
import type { GetDataError } from 'restful-react'
import { get, set, pick, debounce } from 'lodash-es'
import type { FormikErrors } from 'formik'
import { useParams } from 'react-router-dom'
import {
  Container,
  Layout,
  FlexExpander,
  ExpandingSearchInput,
  Color,
  useModalHook,
  SelectOption,
  FormInput,
  MultiSelectOption
} from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { PageSpinner } from '@common/components'
import { shouldShowError } from '@common/utils/errorUtils'
import type { UseGetMockData } from '@common/utils/testUtils'
import { PageError } from '@common/components/Page/PageError'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import type { FilterInterface, FilterDataInterface } from '@common/components/Filter/Constants'
import {
  removeNullAndEmpty,
  isObjectEmpty,
  UNSAVED_FILTER,
  flattenObject
} from '@common/components/Filter/utils/FilterUtils'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'

import { useStrings } from 'framework/strings'
import {
  GetDelegateGroupsNGV2WithFilterQueryParams,
  useGetDelegateGroupsNGV2WithFilter,
  DelegateGroupDetails
} from 'services/portal'
import { usePostFilter, useUpdateFilter, useDeleteFilter, useGetFilterList } from 'services/cd-ng'
import type { FilterDTO, ResponsePageFilterDTO, Failure, DelegateFilterProperties } from 'services/cd-ng'
import useCreateDelegateModal from '@delegates/modals/DelegateModal/useCreateDelegateModal'
import DelegateInstallationError from '@delegates/components/CreateDelegate/K8sDelegate/DelegateInstallationError/DelegateInstallationError'
import { Page, useToaster, StringUtils } from '@common/exports'
import DelegatesEmptyState from '@delegates/images/DelegatesEmptyState.svg'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import DelegateListingItem, { DelegateListingHeader } from './DelegateListingItem'

import css from './DelegatesPage.module.scss'

const POLLING_INTERVAL = 10000

const statusTypes = ['ENABLED', 'WAITING_FOR_APPROVAL', 'DISABLED', 'DELETED']

const fullSizeContentStyle: React.CSSProperties = {
  position: 'fixed',
  top: '135px',
  left: '270px',
  width: 'calc(100% - 270px)',
  height: 'calc(100% - 135px)'
}

interface DelegatesListProps {
  filtersMockData?: UseGetMockData<ResponsePageFilterDTO>
}

export const DelegateListing: React.FC<DelegatesListProps> = ({ filtersMockData }) => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<Record<string, string>>()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<FilterDTO[]>()
  const [appliedFilter, setAppliedFilter] = useState<FilterDTO | null>()
  const { showError } = useToaster()
  const [delegateGroups, setDelegateGroups] = useState<Array<DelegateGroupDetails>>([])
  const [delegateFetchError, setDelegateFetchError] = useState<GetDataError<Failure | Error>>()
  const [isRefreshingFilters, setIsRefreshingFilters] = useState<boolean>(false)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const filterRef = React.useRef<FilterRef<FilterDTO> | null>(null)

  const [troubleshoterOpen, setOpenTroubleshoter] = useState<{ isConnected: boolean | undefined } | undefined>(
    undefined
  )

  const queryParams: GetDelegateGroupsNGV2WithFilterQueryParams = {
    accountId,
    orgId: orgIdentifier,
    projectId: projectIdentifier,
    module,
    pageIndex: page,
    pageSize: 10,
    searchTerm: ''
  } as GetDelegateGroupsNGV2WithFilterQueryParams
  const { mutate: fetchDelegates, loading: isFetchingDelegates } = useGetDelegateGroupsNGV2WithFilter({ queryParams })
  const { openDelegateModal } = useCreateDelegateModal()

  useEffect(() => {
    setPage(0)
    refetchDelegates(queryParams)
  }, [projectIdentifier, orgIdentifier])

  const {
    loading: isFetchingFilters,
    data: fetchedFilterResponse,
    refetch: refetchFilterList
  } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      type: 'Delegate'
    },
    mock: filtersMockData
  })

  useEffect(() => {
    setFilters(fetchedFilterResponse?.data?.content || [])
    setIsRefreshingFilters(isFetchingFilters)
  }, [fetchedFilterResponse])

  const getStatusSelectOptions = (values?: any[]): SelectOption[] => {
    const labelMap = {
      ENABLED: getString('enabledLabel'),
      DISABLED: getString('delegates.delGroupStatus.DISABLED'),
      WAITING_FOR_APPROVAL: getString('delegates.delGroupStatus.WAITING_FOR_APPROVAL'),
      DELETED: getString('deleted')
    }
    return values
      ? values.map(item => {
          return { label: get(labelMap, item, ''), value: item }
        })
      : []
  }

  const refetchDelegates = useCallback(
    async (params: GetDelegateGroupsNGV2WithFilterQueryParams, filter?): Promise<void> => {
      const { delegateGroupIdentifier, delegateName, delegateType, description, hostName, status, tags } = filter || {}
      if (params.searchTerm === '') {
        delete params.searchTerm
      }
      const requestBodyPayload = Object.assign(
        filter
          ? {
              delegateGroupIdentifier,
              delegateName,
              delegateType,
              description,
              hostName,
              status,
              tags
            }
          : {},
        {
          filterType: 'Delegate'
        }
      )
      const sanitizedFilterRequest = removeNullAndEmpty(requestBodyPayload)
      try {
        setDelegateFetchError(undefined)
        const delegateResponse = await fetchDelegates(sanitizedFilterRequest, { queryParams: params })
        const delGroups = delegateResponse?.resource?.delegateGroupDetails || []
        if (delegateResponse.resource) {
          delGroups.forEach((delegateGroup: DelegateGroupDetails) => {
            const delName = `${get(delegateGroup, 'groupName', '')} ${getString('delegate.instancesCount', {
              count: delegateGroup?.delegateInstanceDetails?.length,
              total: ''
            })}`
            set(delegateGroup, 'delegateName', delName)
          })
          setDelegateGroups(delGroups)
        }
      } catch (e) {
        if (shouldShowError(e)) {
          showError(e.data?.message || e.message)
        }
        setDelegateFetchError(e)
      }
    },
    [fetchDelegates]
  )

  // Add polling
  useEffect(() => {
    let timeoutId = 0

    if (!isFetchingDelegates && !delegateFetchError && !isFilterOpen) {
      timeoutId = window.setTimeout(() => {
        refetchDelegates({ ...queryParams, searchTerm }, appliedFilter?.filterProperties)
      }, POLLING_INTERVAL)
    }

    return () => {
      clearTimeout(timeoutId)
    }
  }, [isFetchingDelegates, delegateFetchError, refetchDelegates, isFilterOpen])

  const formatPayload = (data: FilterDataInterface<DelegateFilterProperties, FilterInterface>, isUpdate: boolean) => {
    const {
      metadata: { name: _name, filterVisibility, identifier },
      formValues: { delegateGroupIdentifier, delegateName, delegateType, description, hostName, status, tags }
    } = data
    return {
      name: _name,
      identifier: isUpdate ? identifier : StringUtils.getIdentifierFromName(_name),
      projectIdentifier,
      orgIdentifier,
      filterVisibility: filterVisibility,
      filterProperties: {
        filterType: 'Delegate',
        delegateGroupIdentifier,
        delegateName,
        delegateType,
        description,
        hostName,
        status,
        tags
      } as DelegateFilterProperties
    }
  }

  const handleSaveOrUpdate = async (
    isUpdate: boolean,
    data: FilterDataInterface<DelegateFilterProperties, FilterInterface>
  ): Promise<void> => {
    await setIsRefreshingFilters(true)
    const requestBodyPayload = formatPayload(data, isUpdate)
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

  const DelegateForm = (): React.ReactElement => {
    return (
      <>
        <FormInput.Text name={'delegateName'} label={getString('delegate.delegateName')} key={'delegateName'} />
        <FormInput.Text name={'delegateType'} label={getString('delegate.delegateType')} key={'delegateType'} />
        <FormInput.Text name={'description'} label={getString('description')} key={'description'} />
        <FormInput.Text name={'hostName'} label={getString('delegate.hostName')} key={'hostName'} />
        <FormInput.Select
          items={getStatusSelectOptions(statusTypes)}
          name={'status'}
          label={getString('status')}
          key={'status'}
        />
        <FormInput.Text
          name={'delegateGroupIdentifier'}
          label={getString('delegates.delegateIdentifier')}
          key={'delegateGroupIdentifier'}
        />
        <FormInput.KVTagInput name="tags" label={getString('tagsLabel')} key="tags" />
      </>
    )
  }

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
      type: 'Delegate'
    }
  })

  const [openFilterDrawer, hideFilterDrawer] = useModalHook(() => {
    const onFilterApply = (formData: Record<string, any>) => {
      if (!isObjectEmpty(formData)) {
        const filterFromFormData = { ...formData }
        const updatedQueryParams = {
          ...queryParams,
          searchTerm,
          pageIndex: 0
        }
        refetchDelegates(updatedQueryParams, filterFromFormData)
        setAppliedFilter({ ...unsavedFilter, filterProperties: filterFromFormData })
        setPage(0)
        hideFilterDrawer()
        setIsFilterOpen(false)
      } else {
        showError(getString('filters.invalidCriteria'))
      }
    }

    const { delegateName, delegateGroupIdentifier, delegateType, description, hostName, status, tags } =
      (appliedFilter?.filterProperties as any) || {}
    const { name = '', filterVisibility } = appliedFilter || {}
    return isFetchingDelegates || isFetchingFilters ? (
      <PageSpinner />
    ) : (
      <Filter<DelegateFilterProperties, FilterDTO>
        onApply={onFilterApply}
        onClose={() => {
          hideFilterDrawer()
          setIsFilterOpen(false)
          refetchFilterList()
        }}
        filters={filters}
        initialFilter={{
          formValues: {
            delegateName,
            delegateGroupIdentifier,
            delegateType,
            description,
            hostName,
            status,
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
        isRefreshingFilters={isRefreshingFilters}
        formFields={<DelegateForm />}
        onValidate={(values: Partial<DelegateFilterProperties>): FormikErrors<Partial<DelegateFilterProperties>> => {
          const errors: FormikErrors<{ description?: MultiSelectOption[] }> = {}
          if (values.description === '') {
            errors.description = ''
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
  }, [isRefreshingFilters, filters, appliedFilter, searchTerm, queryParams])

  const reset = (): void => {
    refetchDelegates(queryParams)
    setAppliedFilter(undefined)
    setDelegateFetchError(undefined)
  }

  const debouncedDelegateSearch = useCallback(
    debounce((query: string): void => {
      /* For a non-empty query string, always start from first page(index 0) */
      const updatedQueryParams = {
        ...queryParams,
        searchTerm: query,
        pageIndex: 0
      }
      if (query) {
        refetchDelegates(updatedQueryParams, appliedFilter?.filterProperties)
      } else {
        page === 0 ? refetchDelegates(updatedQueryParams, appliedFilter?.filterProperties) : setPage(0)
      }
    }, 500),
    [refetchDelegates, appliedFilter?.filterProperties]
  )

  const getFilterByIdentifier = (identifier: string): FilterDTO | undefined =>
    /* istanbul ignore if */
    filters?.find((filter: FilterDTO) => filter.identifier?.toLowerCase() === identifier.toLowerCase())

  const handleFilterSelection = (
    option: SelectOption,
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ): void => {
    event?.stopPropagation()
    event?.preventDefault()
    /* istanbul ignore else */
    if (option.value) {
      const selectedFilter = getFilterByIdentifier(option.value?.toString())
      setAppliedFilter(selectedFilter)
      const updatedQueryParams = {
        ...queryParams,
        searchTerm,
        pageIndex: 0
      }
      refetchDelegates(updatedQueryParams, selectedFilter?.filterProperties)
    } else {
      reset()
    }
  }

  const fieldToLabelMapping = new Map<string, string>()
  fieldToLabelMapping.set('delegateGroupIdentifier', getString('delegates.delegateIdentifier'))
  fieldToLabelMapping.set('delegateName', getString('delegate.delegateName'))
  fieldToLabelMapping.set('delegateType', getString('delegate.delegateType'))
  fieldToLabelMapping.set('description', getString('description'))
  fieldToLabelMapping.set('hostName', getString('delegate.hostName'))
  fieldToLabelMapping.set('status', getString('status'))
  fieldToLabelMapping.set('tags', getString('delegate.delegateTags'))

  const permissionRequestNewDelegate = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    permission: PermissionIdentifier.UPDATE_DELEGATE,
    resource: {
      resourceType: ResourceType.DELEGATE
    }
  }

  const newDelegateBtn = (
    <RbacButton
      intent="primary"
      text={getString('delegates.newDelegate')}
      icon="plus"
      permission={permissionRequestNewDelegate}
      onClick={() => openDelegateModal()}
      id="newDelegateBtn"
      data-test="newDelegateButton"
    />
  )

  const hideHeader = delegateGroups.length === 0 && !appliedFilter && !searchTerm

  return (
    <Container>
      <Dialog
        isOpen={!!troubleshoterOpen}
        enforceFocus={false}
        style={{ width: '680px', height: '100%' }}
        onClose={() => setOpenTroubleshoter(undefined)}
      >
        <DelegateInstallationError showDelegateInstalledMessage={false} />
      </Dialog>
      {!hideHeader && (
        <Layout.Horizontal className={css.header}>
          {newDelegateBtn}
          <FlexExpander />
          <Layout.Horizontal spacing="xsmall">
            <ExpandingSearchInput
              alwaysExpanded
              width={250}
              placeholder={getString('delegates.searchDelegateName')}
              throttle={200}
              onChange={text => {
                debouncedDelegateSearch(text)
                setSearchTerm(text.trim())
              }}
              className={css.search}
            />
            <FilterSelector<FilterDTO>
              appliedFilter={appliedFilter}
              filters={filters}
              onFilterBtnClick={() => {
                openFilterDrawer()
                setIsFilterOpen(true)
              }}
              onFilterSelect={handleFilterSelection}
              fieldToLabelMapping={fieldToLabelMapping}
              filterWithValidFields={removeNullAndEmpty(
                pick(flattenObject(appliedFilter?.filterProperties || {}), ...fieldToLabelMapping.keys())
              )}
            />
          </Layout.Horizontal>
        </Layout.Horizontal>
      )}
      <Page.Body>
        {isFetchingDelegates ? (
          <Container style={fullSizeContentStyle}>
            <ContainerSpinner />
          </Container>
        ) : delegateFetchError && shouldShowError(delegateFetchError) ? (
          <div style={{ paddingTop: '200px' }}>
            <PageError
              message={(delegateFetchError?.data as Error)?.message || delegateFetchError?.message}
              onClick={(e: React.MouseEvent<Element, MouseEvent>) => {
                e.preventDefault()
                e.stopPropagation()
                reset()
              }}
            />
          </div>
        ) : (
          <Container className={css.delegateListContainer} background={Color.GREY_100}>
            {delegateGroups.length ? (
              <Container className={css.delegateListContainer} background={Color.GREY_100}>
                <DelegateListingHeader />
                {delegateGroups.map((delegate: DelegateGroupDetails) => (
                  <DelegateListingItem
                    key={delegate.delegateGroupIdentifier}
                    delegate={delegate}
                    setOpenTroubleshoter={setOpenTroubleshoter}
                  />
                ))}
              </Container>
            ) : (
              <div className={css.emptyStateContainer}>
                <img src={DelegatesEmptyState} />
                <div className={css.emptyStateText}>
                  {projectIdentifier
                    ? getString('delegates.noDelegatesInProject')
                    : orgIdentifier
                    ? getString('delegates.noDelegatesInOrganization')
                    : getString('delegates.noDelegatesInAccount')}
                </div>
                {hideHeader && newDelegateBtn}
              </div>
            )}
          </Container>
        )}
      </Page.Body>
    </Container>
  )
}
export default DelegateListing
