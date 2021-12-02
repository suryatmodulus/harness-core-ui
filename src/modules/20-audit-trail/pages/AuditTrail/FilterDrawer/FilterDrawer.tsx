import React from 'react'
import { useParams } from 'react-router-dom'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import { FilterDTO, useDeleteFilter, usePostFilter, useUpdateFilter } from 'services/cd-ng'
import type { AuditFilterProperties } from 'services/audit'
import type { FilterDataInterface } from '@common/components/Filter/Constants'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import AuditTrailFilterForm from './AuditTrailFilterForm'
import RequestUtil from '../utils/RequestUtil'

interface FilterDrawerProps {
  closeDrawer: () => void
  filters: FilterDTO[]
  onApply: (filters: AuditFilterProperties) => void
  refetchFilters: () => void
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ closeDrawer, filters, onApply, refetchFilters }) => {
  const filterRef = React.useRef<FilterRef<FilterDTO> | null>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const onFiltersApply = (formData: Record<string, any>): void => {
    const filterFromFormData = RequestUtil.getValidFilterArguments(formData)
    onApply(filterFromFormData)
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
      type: 'Connector'
    }
  })

  const handleDelete = async (identifier: string): Promise<void> => {
    const deleteHandler = filterRef.current?.deleteFilterHandler
    if (deleteHandler && typeof deleteFilter === 'function') {
      await deleteHandler(identifier)
    }

    await refetchFilters()
  }

  const handleSaveOrUpdate = async (
    isUpdate: boolean,
    data: FilterDataInterface<AuditFilterProperties, FilterDTO>
  ): Promise<void> => {
    // const requestBodyPayload = createRequestBodyPayload({ isUpdate, data, projectIdentifier, orgIdentifier })
    // const saveOrUpdateHandler = filterRef.current?.saveOrUpdateFilterHandler
    // if (saveOrUpdateHandler && typeof saveOrUpdateHandler === 'function') {
    //   const updatedFilter = await saveOrUpdateHandler(isUpdate, requestBodyPayload)
    //   setAppliedFilter(updatedFilter)
    // }
    await refetchFilters()
  }

  return (
    <Filter<AuditFilterProperties, FilterDTO>
      formFields={<AuditTrailFilterForm />}
      onApply={onFiltersApply}
      filters={filters}
      initialFilter={{
        formValues: {},
        metadata: {
          name: 'filtername',
          identifier: 'filterIdentifier',
          filterProperties: {}
        }
      }}
      onDelete={handleDelete}
      isRefreshingFilters={false}
      onFilterSelect={() => {
        // empty body
      }}
      onSaveOrUpdate={handleSaveOrUpdate}
      onClose={closeDrawer}
      ref={filterRef}
      dataSvcConfig={
        new Map<CrudOperation, (...rest: any[]) => Promise<any>>([
          ['ADD', createFilter],
          ['UPDATE', updateFilter],
          ['DELETE', deleteFilter]
        ])
      }
    />
  )
}

export default FilterDrawer
