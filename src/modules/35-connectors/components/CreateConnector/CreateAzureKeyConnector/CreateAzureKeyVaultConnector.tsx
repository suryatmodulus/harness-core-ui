import React from 'react'
import { StepWizard } from '@wings-software/uicore'

import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  GIT_TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import { useStrings } from 'framework/strings'
import { buildAzureKeyVaultPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import AzureKeyVaultForm from './views/AzureKeyVaultForm'
import SetupVault from './views/SetupVault'
import css from './CreateAzureKeyVaultConnector.module.scss'

const CreateAzureKeyVaultConnector: React.FC<CreateConnectorModalProps> = props => {
  const { onClose, onSuccess } = props
  const { getString } = useStrings()
  return (
    <StepWizard
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
        disableGitSync={true}
      />
      <AzureKeyVaultForm
        name={getString('details')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        connectorInfo={props.connectorInfo}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        accountId={props.accountId}
        orgIdentifier={props.orgIdentifier}
        projectIdentifier={props.projectIdentifier}
      />
      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildAzureKeyVaultPayload}
        hideModal={onClose}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
        disableGitSync={true}
        submitOnNextStep
      />
      <SetupVault
        name={getString('connectors.azureKeyVault.labels.setupVault')}
        onConnectorCreated={onSuccess}
        connectorInfo={props.connectorInfo}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        accountId={props.accountId}
        orgIdentifier={props.orgIdentifier}
        projectIdentifier={props.projectIdentifier}
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        connectorInfo={props.connectorInfo}
        isStep
        onClose={onClose}
        isLastStep={true}
        type={Connectors.AZURE_KEY_VAULT}
        stepIndex={GIT_TESTCONNECTION_STEP_INDEX}
      />
    </StepWizard>
  )
}

export default CreateAzureKeyVaultConnector
