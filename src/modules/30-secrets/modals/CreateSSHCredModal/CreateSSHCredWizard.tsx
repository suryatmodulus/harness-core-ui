import React from 'react'
import { StepWizard } from '@wings-software/uicore'

import { useStrings } from 'framework/exports'
import StepSSHDetails from './views/StepDetails'
import StepAuthentication from './views/StepAuthentication'
import StepVerify from './views/StepVerify'

import type { DetailsForm } from './views/StepDetails'
import type { SSHConfigFormData } from './views/StepAuthentication'

interface CreateSSHCredWizardProps {
  onSuccess?: () => void
  hideModal?: () => void
}

export interface SSHCredSharedObj {
  detailsData?: DetailsForm
  authData?: SSHConfigFormData
  isEdit?: boolean
}

const CreateSSHCredWizard: React.FC<CreateSSHCredWizardProps & SSHCredSharedObj> = props => {
  const { isEdit } = props
  const { getString } = useStrings()

  return (
    <StepWizard<SSHCredSharedObj> icon="secret-ssh" iconProps={{ size: 37 }} title={getString('secrets.sshCredential')}>
      <StepSSHDetails name={getString('secrets.titleDetails')} {...props} />
      <StepAuthentication name={getString('secrets.stepTitleAuth')} onSuccess={props.onSuccess} isEdit={isEdit} />
      <StepVerify name={getString('secrets.stepTitleVerify')} closeModal={props.hideModal} />
    </StepWizard>
  )
}

export default CreateSSHCredWizard
