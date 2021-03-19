import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { useStrings } from 'framework/exports'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { buildGitlabPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import GitDetailsStep from '../commonSteps/GitDetailsStep'
import StepGitlabAuthentication from './StepAuth/StepGitlabAuthentication'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'

const CreateGitlabConnector = (props: CreateConnectorModalProps): JSX.Element => {
  const { getString } = useStrings()
  const commonProps = pick(props, [
    'isEditMode',
    'connectorInfo',
    'setIsEditMode',
    'accountId',
    'orgIdentifier',
    'projectIdentifier'
  ])

  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.GITLAB)}
      iconProps={{ size: 37 }}
      title={getString(getConnectorTitleIdByType(Connectors.GITLAB))}
    >
      <ConnectorDetailsStep
        type={Connectors.GITLAB}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
      />
      <GitDetailsStep
        type={Connectors.GITLAB}
        name={getString('details')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
      />
      <StepGitlabAuthentication name={getString('credentials')} {...commonProps} onConnectorCreated={props.onSuccess} />
      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildGitlabPayload}
        hideModal={props.onClose}
        onConnectorCreated={props.onSuccess}
        connectorInfo={props.connectorInfo}
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        isStep={true}
        isLastStep={true}
        type={Connectors.GITLAB}
        onClose={props.onClose}
      />
    </StepWizard>
  )
}

export default CreateGitlabConnector
