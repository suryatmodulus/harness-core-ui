import React from 'react'
import { StepWizard } from '@wings-software/uicore'

import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import { useStrings } from 'framework/strings'
import type { ConnectorInfoDTO, ConnectorRequestBody } from 'services/cd-ng'

import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import AzureKeyVaultForm from './views/AzureKeyVaultForm'
import css from './CreateAzureKeyVaultConnector.module.scss'

export interface CreateAzureKeyVaultConnectorProps {
  onClose: () => void
  onSuccess: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  mock?: any
  connectorInfo?: ConnectorInfoDTO | void
}

export interface StepSecretManagerProps extends ConnectorInfoDTO {
  isEdit: boolean
  spec: any
}

const CreateAzureKeyVaultConnector: React.FC<CreateAzureKeyVaultConnectorProps> = props => {
  const { onClose, onSuccess } = props
  const { getString } = useStrings()
  return (
    <StepWizard<StepSecretManagerProps>
      icon={getConnectorIconByType(Connectors.AZURE_KEY_VAULT)}
      iconProps={{ size: 37 }}
      title={getString(getConnectorTitleIdByType(Connectors.AZURE_KEY_VAULT))}
      className={css.wizardNav}
    >
      <ConnectorDetailsStep
        type={Connectors.AZURE_KEY_VAULT}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
      />
      <AzureKeyVaultForm
        {...props}
        name={getString('details')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        onSuccess={onSuccess}
        mock={props.mock}
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        connectorInfo={props.connectorInfo}
        isStep
        onClose={onClose}
        isLastStep={true}
        type={Connectors.AZURE_KEY_VAULT}
      />
    </StepWizard>
  )
}

export default CreateAzureKeyVaultConnector
