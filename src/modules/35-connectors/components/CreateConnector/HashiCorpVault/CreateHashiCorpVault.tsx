import React from 'react'
import { StepWizard } from '@wings-software/uicore'

import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  SECRET_MANAGER_TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import { useStrings } from 'framework/strings'
import type { ConnectorInfoDTO, ConnectorRequestBody } from 'services/cd-ng'

import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import VaultConfigForm from './views/VaultConfigForm'

export interface CreateHashiCorpVaultProps {
  onClose: () => void
  onSuccess: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  mock?: any
  connectorInfo?: ConnectorInfoDTO | void
  gitDetails?: IGitContextFormProps
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
        gitDetails={props.gitDetails}
        disableGitSync={true}
      />
      <VaultConfigForm
        name={getString('connectors.hashiCorpVault.stepTwoName')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        {...props}
        onSuccess={onSuccess}
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        connectorInfo={props.connectorInfo}
        isStep
        onClose={onClose}
        isLastStep={true}
        type={Connectors.VAULT}
        stepIndex={SECRET_MANAGER_TESTCONNECTION_STEP_INDEX}
      />
    </StepWizard>
  )
}

export default CreateHashiCorpVault
