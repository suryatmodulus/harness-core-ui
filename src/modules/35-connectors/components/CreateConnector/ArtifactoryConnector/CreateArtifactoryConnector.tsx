import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { buildArtifactoryPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import StepArtifactoryAuthentication from './StepAuth/StepArtifactoryAuthentication'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'

const CreateArtifactoryConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  const commonProps = pick(props, [
    'isEditMode',
    'setIsEditMode',
    'connectorInfo',
    'gitDetails',
    'accountId',
    'orgIdentifier',
    'projectIdentifier'
  ])
  return (
    <>
      <StepWizard
        icon={getConnectorIconByType(Connectors.ARTIFACTORY)}
        iconProps={{ size: 45 }}
        title={getString(getConnectorTitleIdByType(Connectors.ARTIFACTORY))}
      >
        <ConnectorDetailsStep
          type={Connectors.ARTIFACTORY}
          name={getString('overview')}
          isEditMode={props.isEditMode}
          connectorInfo={props.connectorInfo}
          gitDetails={props.gitDetails}
          mock={props.mock}
        />
        <StepArtifactoryAuthentication
          name={getString('details')}
          identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
          {...commonProps}
          onConnectorCreated={props.onSuccess}
        />
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          isEditMode={props.isEditMode}
          setIsEditMode={props.setIsEditMode}
          buildPayload={buildArtifactoryPayload}
          hideModal={props.onClose}
          onConnectorCreated={props.onSuccess}
          connectorInfo={props.connectorInfo}
          gitDetails={props.gitDetails}
        />
        <VerifyOutOfClusterDelegate
          name={getString('connectors.stepThreeName')}
          connectorInfo={props.connectorInfo}
          isStep={true}
          isLastStep={true}
          type={Connectors.ARTIFACTORY}
          onClose={props.onClose}
          setIsEditMode={props.setIsEditMode}
          stepIndex={TESTCONNECTION_STEP_INDEX}
        />
      </StepWizard>
    </>
  )
}

export default CreateArtifactoryConnector
