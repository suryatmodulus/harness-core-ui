import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { Connectors } from '@connectors/constants'
import { getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useStrings } from 'framework/strings'
import ProviderOverviewStep from '../ProviderOverviewStep/ProviderOverviewStep'
import type { BaseProviderStepProps } from '../types'
import TestConnection from '../TestConnection/TestConnection'

import css from './CreateProvider.module.scss'

type PickedProps = 'isEditMode' | 'onLaunchArgoDashboard' | 'provider' | 'onUpdateMode' | 'onClose'

type CreateArgoProviderProps = Pick<BaseProviderStepProps, PickedProps>

const CreateArgoProvider: React.FC<CreateArgoProviderProps> = props => {
  const { getString } = useStrings()

  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.ARGO)}
      iconProps={{ size: 50 }}
      title={getString('cd.gitOpsWizardTitle')}
      className={css.stepWizard}
    >
      <ProviderOverviewStep name={getString('overview')} {...props} />
      <TestConnection {...props} name={getString('common.labelTestConnection')} />
    </StepWizard>
  )
}

export default CreateArgoProvider
