import React from 'react'

import { Color, StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import type { ConnectorConfigDTO, ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'

import { getConnectorTitleIdByType, getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useStrings } from 'framework/exports'
import StepHelmAuth from '@connectors/components/CreateConnector/HelmRepoConnector/StepHelmRepoAuth'
import { buildHelmPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'

interface CreateHelmConnectorProps {
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
const HelmRepoConnector: React.FC<CreateHelmConnectorProps> = props => {
  const { getString } = useStrings()
  const commonProps = pick(props, ['accountId', 'orgIdentifier', 'projectIdentifier'])

  const [isEditMode, setIsEditMode] = React.useState(props?.isEditMode || false)
  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.HttpHelmRepo)}
      iconProps={{ size: 50, color: Color.WHITE }}
      title={getString(getConnectorTitleIdByType(Connectors.HttpHelmRepo))}
    >
      <ConnectorDetailsStep
        type={Connectors.HttpHelmRepo}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
      />
      <StepHelmAuth
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
        buildPayload={buildHelmPayload}
        hideModal={props.onClose}
        onConnectorCreated={props.onConnectorCreated}
        connectorInfo={props.connectorInfo}
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        isStep={true}
        isLastStep={true}
        type={Connectors.HttpHelmRepo}
        onClose={props.onClose}
      />
    </StepWizard>
  )
}

export default HelmRepoConnector
