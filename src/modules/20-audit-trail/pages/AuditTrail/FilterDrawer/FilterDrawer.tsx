import React from 'react'
import { Filter } from '@common/components/Filter/Filter'
import type { FilterDTO } from 'services/cd-ng'
import type { FilterDataInterface } from '@common/components/Filter/Constants'
import AuditTrailFilterForm from './AuditTrailFilterForm'

interface FilterDrawerProps {
  closeDrawer: () => void
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ closeDrawer }) => {
  return (
    <Filter<{}, FilterDTO>
      formFields={<AuditTrailFilterForm />}
      onApply={() => {
        //on apply filters
      }}
      onClose={closeDrawer}
      onSaveOrUpdate={(_isUpdate: boolean, _data: FilterDataInterface<{}, FilterDTO>) => {
        //empty
      }}
      onFilterSelect={() => {
        //empty
      }}
      initialFilter={{
        formValues: {},
        metadata: { filterProperties: {}, identifier: 'filterOne', name: 'filter one' }
      }}
    />
  )
}

export default FilterDrawer
