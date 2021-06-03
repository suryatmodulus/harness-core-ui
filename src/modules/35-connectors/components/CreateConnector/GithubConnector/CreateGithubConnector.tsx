import React from 'react'
import { StepWizard, Color } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  GIT_TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { useStrings } from 'framework/strings'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { buildGithubPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import GitDetailsStep from '../commonSteps/GitDetailsStep'
import StepGithubAuthentication from './StepAuth/StepGithubAuthentication'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'

const CreateGithubConnector = (props: CreateConnectorModalProps): JSX.Element => {
  const { getString } = useStrings()
  const commonProps = pick(props, [
    'isEditMode',
    'connectorInfo',
    'gitDetails',
    'setIsEditMode',
    'accountId',
    'orgIdentifier',
    'projectIdentifier'
  ])

  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.GITHUB)}
      iconProps={{ size: 37, color: Color.BLACK }}
      title={getString(getConnectorTitleIdByType(Connectors.GITHUB))}
    >
      <ConnectorDetailsStep
        type={Connectors.GITHUB}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
        mock={props.mock}
      />
      <GitDetailsStep
        type={Connectors.GITHUB}
        name={getString('details')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
      />
      <StepGithubAuthentication
        name={getString('credentials')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        {...commonProps}
        onConnectorCreated={props.onSuccess}
      />
      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildGithubPayload}
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
        type={Connectors.GITHUB}
        onClose={props.onClose}
        stepIndex={GIT_TESTCONNECTION_STEP_INDEX}
      />
    </StepWizard>
  )
}

export default CreateGithubConnector
