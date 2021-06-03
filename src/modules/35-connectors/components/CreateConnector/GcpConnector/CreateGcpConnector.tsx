import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { buildGcpPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import GcpAuthentication from './StepAuth/GcpAuthentication'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'

const CreateGcpConnector: React.FC<CreateConnectorModalProps> = props => {
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
        icon={getConnectorIconByType(Connectors.GCP)}
        iconProps={{ size: 37 }}
        title={getString(getConnectorTitleIdByType(Connectors.GCP))}
      >
        <ConnectorDetailsStep
          type={Connectors.GCP}
          name={getString('overview')}
          isEditMode={props.isEditMode}
          connectorInfo={props.connectorInfo}
          gitDetails={props.gitDetails}
          mock={props.mock}
        />
        <GcpAuthentication
          name={getString('details')}
          identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
          {...commonProps}
          onConnectorCreated={props.onSuccess}
          connectorInfo={props.connectorInfo}
        />
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          isEditMode={props.isEditMode}
          setIsEditMode={props.setIsEditMode}
          buildPayload={buildGcpPayload}
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
          type={Connectors.GCP}
          onClose={props.onClose}
          stepIndex={TESTCONNECTION_STEP_INDEX}
        />
      </StepWizard>
    </>
  )
}

export default CreateGcpConnector
