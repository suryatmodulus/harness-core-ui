import React, { useState } from 'react'
import { SelectOption, useModalHook } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import { AuditFilterProperties, FilterDTO, useGetFilterList } from 'services/audit'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { removeNullAndEmpty } from '@common/components/Filter/utils/FilterUtils'
import { useStrings } from 'framework/strings'
import { formToLabelMap, getFormValuesFromFilterProperties } from '@audit-trail/utils/RequestUtil'
import FilterDrawer from './FilterDrawer/FilterDrawer'

interface AuditFiltersProps {
  applyFilters?: (filtersProperties: AuditFilterProperties) => void
}

const AuditTrailsFilters: React.FC<AuditFiltersProps> = ({ applyFilters }) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [selectedFilter, setSelectedFilter] = useState<FilterDTO | undefined>()
  const { getString } = useStrings()

  const fieldToLabelMapping = new Map<string, string>()
  fieldToLabelMapping.set('users', getString('common.userLabel'))
  fieldToLabelMapping.set('organizations', getString('orgLabel'))
  fieldToLabelMapping.set('projects', getString('projectLabel'))
  fieldToLabelMapping.set('modules', getString('common.moduleLabel'))
  fieldToLabelMapping.set('resourceType', getString('common.resourceTypeLabel'))
  fieldToLabelMapping.set('actions', getString('action'))

  const { data: filterResponse, refetch: refetchFilterList } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      type: 'Audit'
    }
  })

  const onFilterSelect = (identifier?: string): void => {
    let filter
    if (identifier) {
      filter = filterResponse?.data?.content?.find(filtr => filtr.identifier === identifier)
    }
    setSelectedFilter(filter)
    applyFilters?.(filter?.filterProperties || {})
  }

  const [openDrawer, closeDrawer] = useModalHook(() => {
    return (
      <FilterDrawer
        filters={filterResponse?.data?.content || []}
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

  return (
    <FilterSelector<FilterDTO>
      appliedFilter={selectedFilter}
      filters={filterResponse?.data?.content}
      onFilterBtnClick={openDrawer}
      onFilterSelect={(option: SelectOption) => {
        onFilterSelect(option.value as string)
      }}
      fieldToLabelMapping={fieldToLabelMapping}
      filterWithValidFields={formToLabelMap(
        removeNullAndEmpty(getFormValuesFromFilterProperties(selectedFilter?.filterProperties || {}, getString))
      )}
    />
  )
}

export default AuditTrailsFilters
