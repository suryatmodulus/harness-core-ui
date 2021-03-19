import React from 'react'
import { StepWizard, Color } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { Connectors } from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { buildDockerPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/exports'
import type { ConnectorRequestBody, ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'
import StepDockerAuthentication from './StepAuth/StepDockerAuthentication'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'

interface CreateDockerConnectorProps {
  onClose: () => void
  onSuccess?: (data?: ConnectorRequestBody) => void | Promise<void>
  mock?: ResponseBoolean
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  connectorInfo?: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}
const CreateDockerConnector: React.FC<CreateDockerConnectorProps> = props => {
  const { getString } = useStrings()
  const commonProps = pick(props, ['isEditMode', 'setIsEditMode', 'accountId', 'orgIdentifier', 'projectIdentifier'])
  return (
    <>
      <StepWizard
        icon={getConnectorIconByType(Connectors.DOCKER)}
        iconProps={{ size: 37, color: Color.WHITE }}
        title={getString(getConnectorTitleIdByType(Connectors.DOCKER))}
      >
        <ConnectorDetailsStep
          type={Connectors.DOCKER}
          name={getString('overview')}
          isEditMode={props.isEditMode}
          connectorInfo={props.connectorInfo}
          mock={props.mock}
        />
        <StepDockerAuthentication
          name={getString('details')}
          {...commonProps}
          onConnectorCreated={props.onSuccess}
          connectorInfo={props.connectorInfo}
        />
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          isEditMode={props.isEditMode}
          setIsEditMode={props.setIsEditMode}
          buildPayload={buildDockerPayload}
          hideModal={props.onClose}
          onConnectorCreated={props.onSuccess}
          connectorInfo={props.connectorInfo}
        />
        <VerifyOutOfClusterDelegate
          name={getString('connectors.stepThreeName')}
          isStep={true}
          isLastStep={true}
          type={Connectors.DOCKER}
          onClose={props.onClose}
        />
      </StepWizard>
    </>
  )
}

export default CreateDockerConnector
