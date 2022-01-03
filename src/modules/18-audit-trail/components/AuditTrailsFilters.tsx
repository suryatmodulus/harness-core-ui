import React, { useState } from 'react'
import { SelectOption, useModalHook } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import { AuditFilterProperties, FilterDTO, useGetFilterList } from 'services/audit'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import FilterDrawer from './FilterDrawer/FilterDrawer'

interface AuditFiltersProps {
  applyFilters?: (filtersProperties: AuditFilterProperties) => void
}

const AuditTrailsFilters: React.FC<AuditFiltersProps> = ({ applyFilters }) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [selectedFilter, setSelectedFilter] = useState<FilterDTO | undefined>()

  const { data: filterResponse, refetch: refetchFilterList } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      type: 'Audit'
    }
  })
  const filters = filterResponse?.data?.content

  const onFilterSelect = (identifier?: string): void => {
    let filter
    if (identifier) {
      filter = filters?.find(filtr => filtr.identifier === identifier)
    }
    setSelectedFilter(filter)
    applyFilters?.(filter?.filterProperties || {})
  }

  const [openDrawer, closeDrawer] = useModalHook(() => {
    return (
      <FilterDrawer
        filters={filters || []}
        closeDrawer={closeDrawer}
        refetchFilters={refetchFilterList}
        selectedFilter={selectedFilter}
        selectFilter={setSelectedFilter}
        applyFilter={(filter: FilterDTO) => {
          closeDrawer()
          setSelectedFilter(filter)
          applyFilters?.(filter.filterProperties)
        }}
      />
    )
  }, [filterResponse, selectedFilter])

  const onFilterButtonClick = (): void => {
    openDrawer()
  }

  return (
    <>
      <FilterSelector<FilterDTO>
        appliedFilter={selectedFilter}
        filters={filterResponse?.data?.content}
        onFilterBtnClick={onFilterButtonClick}
        onFilterSelect={(option: SelectOption) => {
          onFilterSelect(option.value as string)
        }}
        fieldToLabelMapping={new Map<string, string>()}
        filterWithValidFields={{}}
      />
    </>
  )
}

export default AuditTrailsFilters
