import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import { useStrings } from 'framework/strings'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { buildAWSSecretManagerPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import AwsSecretManagerConfig from './views/AwsSecretManagerConfig'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'

const CreateAwsSecretManagerConnector: React.FC<CreateConnectorModalProps> = props => {
  const { onClose, onSuccess } = props
  const { getString } = useStrings()
  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.AWS_SECRET_MANAGER)}
      iconProps={{ size: 37 }}
      title={getString(getConnectorTitleIdByType(Connectors.AWS_SECRET_MANAGER))}
    >
      <ConnectorDetailsStep
        type={Connectors.AWS_SECRET_MANAGER}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
        gitDetails={props.gitDetails}
        disableGitSync={true}
      />
      <AwsSecretManagerConfig
        name={getString('details')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        {...props}
        connectorInfo={props.connectorInfo}
      />
      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildAWSSecretManagerPayload}
        hideModal={onClose}
        onConnectorCreated={onSuccess}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
        disableGitSync={true}
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        connectorInfo={props.connectorInfo}
        isStep
        onClose={onClose}
        isLastStep={true}
        type={Connectors.AWS_SECRET_MANAGER}
        stepIndex={TESTCONNECTION_STEP_INDEX}
      />
    </StepWizard>
  )
}

export default CreateAwsSecretManagerConnector
