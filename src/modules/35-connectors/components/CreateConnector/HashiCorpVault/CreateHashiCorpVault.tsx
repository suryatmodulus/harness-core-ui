import React from 'react'
import { StepWizard } from '@wings-software/uicore'

import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import { useStrings } from 'framework/exports'
import type { ConnectorInfoDTO, ConnectorRequestBody } from 'services/cd-ng'

import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import VaultConfigForm from './views/VaultConfigForm'

export interface CreateHashiCorpVaultProps {
  onClose: () => void
  onSuccess: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  mock?: any
  connectorInfo?: ConnectorInfoDTO | void
}

export interface StepSecretManagerProps extends ConnectorInfoDTO {
  isEdit: boolean
}

const CreateHashiCorpVault: React.FC<CreateHashiCorpVaultProps> = props => {
  const { onClose, onSuccess } = props
  const { getString } = useStrings()
  return (
    <StepWizard<StepSecretManagerProps>
      icon={getConnectorIconByType(Connectors.VAULT)}
      iconProps={{ size: 37 }}
      title={getString(getConnectorTitleIdByType(Connectors.VAULT))}
    >
      <ConnectorDetailsStep
        type={Connectors.VAULT}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
      />
      <VaultConfigForm
        name={getString('connectors.hashiCorpVault.stepTwoName')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        {...props}
        onSuccess={onSuccess}
      />
      <VerifyOutOfClusterDelegate
        name={getString('common.testConnection')}
        isStep
        onClose={onClose}
        isLastStep={true}
        type={Connectors.VAULT}
      />
    </StepWizard>
  )
}

export default CreateHashiCorpVault
