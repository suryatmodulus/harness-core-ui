import React from 'react'
import type { StepProps } from '@wings-software/uicore'
import type { Organization } from 'services/cd-ng'
import CreateOrganization from './CreateOrganization'
import EditOrganization from './EditOrganization'

export interface OrgModalData {
  onSuccess?: (Organization: Organization | undefined) => void
}

const StepAboutOrganization: React.FC<StepProps<Organization> & OrgModalData> = props => {
  const { prevStepData } = props
  const isStepBack = prevStepData?.identifier ? true : false
  return <>{isStepBack ? <EditOrganization isStep={isStepBack} {...props} /> : <CreateOrganization {...props} />}</>
}

export default StepAboutOrganization
