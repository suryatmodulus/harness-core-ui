import { FormInput } from '@wings-software/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'

const AuditTrailFilterForm: React.FC = () => {
  const { getString } = useStrings()
  return (
    <>
      <FormInput.Text name="action" label={getString('action')} key="action" />
      <FormInput.Text name="module" label={getString('module')} key="module" />
    </>
  )
}

export default AuditTrailFilterForm
