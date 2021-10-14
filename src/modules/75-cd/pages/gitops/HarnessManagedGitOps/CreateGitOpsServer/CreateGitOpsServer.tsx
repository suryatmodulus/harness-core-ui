import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import GitOpsServerOverviewStep from '../GitOpsServerOverviewStep/GitOpsServerOverviewStep'
import type { BaseProviderStepProps } from '../../types'
import VerifyConnection from '../VerifyConnection/VerifyConnection'
import SetupGitOpsServerStep from '../SetupGitOpsServerStep/SetupGitOpsServerStep'
import css from './CreateGitOpsServer.module.scss'

type PickedProps = 'isEditMode' | 'onLaunchArgoDashboard' | 'provider' | 'onUpdateMode' | 'onClose'

type CreateGitOpsServerProps = Pick<BaseProviderStepProps, PickedProps>

const CreateGitOpsServer: React.FC<CreateGitOpsServerProps> = props => {
  const { getString } = useStrings()

  return (
    <StepWizard
      icon={'harness'}
      iconProps={{ size: 50 }}
      title={getString('cd.harnessManagedGitOpsWizardTitle')}
      className={css.stepWizard}
    >
      <GitOpsServerOverviewStep name={getString('overview')} {...props} />
      <SetupGitOpsServerStep name={getString('cd.setupGitOpsServerStep')} {...props} />
      <VerifyConnection {...props} name={getString('secrets.stepTitleVerify')} />
    </StepWizard>
  )
}

export default CreateGitOpsServer
