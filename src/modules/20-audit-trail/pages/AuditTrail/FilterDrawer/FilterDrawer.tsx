import React from 'react'
import { Filter } from '@common/components/Filter/Filter'
import type { FilterDTO } from 'services/cd-ng'
import type { AuditFilterProperties } from 'services/audit'
import type { FilterDataInterface } from '@common/components/Filter/Constants'
import AuditTrailFilterForm from './AuditTrailFilterForm'

interface FilterDrawerProps {
  closeDrawer: () => void
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ closeDrawer }) => {
  return (
    <Filter<AuditFilterProperties, FilterDTO>
      formFields={<AuditTrailFilterForm />}
      onApply={() => {
        //on apply filters
      }}
      onClose={closeDrawer}
      onSaveOrUpdate={(isUpdate: boolean, data: FilterDataInterface<AuditFilterProperties, FilterDTO>) => {
        console.log('isupdate', isUpdate)
        console.log('data', data)
      }}
    />
  )
}

export default FilterDrawer
