import React from 'react'

import { StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import type { ConnectorConfigDTO, ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'

import { getConnectorTitleIdByType, getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useStrings } from 'framework/exports'
import { buildJiraPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import JiraDetailsForm from './JiraDetailsForm'

interface CreateJiraConnectorProps {
  onConnectorCreated?: (data?: ConnectorConfigDTO) => void | Promise<void>
  mock?: ResponseBoolean
  onClose: () => void
  isEditMode?: boolean
  connectorInfo?: ConnectorInfoDTO | void
  context?: number
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}
const JiraConnector: React.FC<CreateJiraConnectorProps> = props => {
  const { getString } = useStrings()
  const commonProps = pick(props, ['accountId', 'orgIdentifier', 'projectIdentifier'])

  const [isEditMode, setIsEditMode] = React.useState(props?.isEditMode || false)
  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.Jira)}
      iconProps={{ size: 50 }}
      title={getString(getConnectorTitleIdByType(Connectors.Jira))}
    >
      <ConnectorDetailsStep
        type={Connectors.Jira}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
      />
      <JiraDetailsForm
        name={getString('details')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        {...commonProps}
        onConnectorCreated={props.onConnectorCreated}
        isEditMode={isEditMode}
        connectorInfo={props.connectorInfo}
        setIsEditMode={setIsEditMode}
      />
      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        buildPayload={buildJiraPayload}
        hideModal={props.onClose}
        onConnectorCreated={props.onConnectorCreated}
        connectorInfo={props.connectorInfo}
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        isStep={true}
        isLastStep={true}
        type={Connectors.Jira}
        onClose={props.onClose}
      />
    </StepWizard>
  )
}

export default JiraConnector
