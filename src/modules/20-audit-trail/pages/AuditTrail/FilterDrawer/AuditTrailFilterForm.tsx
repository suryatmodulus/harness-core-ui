import { FormInput } from '@wings-software/uicore'
import React from 'react'

// const orgOptions: MultiSelectOption[] = [
//   {
//     label: ''
//   }
// ]

const AuditTrailFilterForm: React.FC = () => {
  return (
    <>
      <FormInput.Text name="user" label="User" key="user" placeholder="Enter name or email" />
      <FormInput.MultiSelect items={[]} name="org" label="Org" key="org" />
      <FormInput.MultiSelect
        items={[]}
        name="project"
        label="Project"
        key="project"
        placeholder="Type to view suggestions"
      />
      <FormInput.MultiSelect items={[]} name="module" label="Module" key="module" />
      <FormInput.MultiSelect items={[]} name="environment" label="Environment" key="environment" />
      <FormInput.MultiSelect items={[]} name="resourceType" label="Resource Type" key="resourceType" />
      <FormInput.MultiSelect items={[]} name="resourceName" label="Resource Name" key="resourceName" />
      <FormInput.MultiSelect items={[]} name="action" label="Action" key="action" />
    </>
  )
}

export default AuditTrailFilterForm
