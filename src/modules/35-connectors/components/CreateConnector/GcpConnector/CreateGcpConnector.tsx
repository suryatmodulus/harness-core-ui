import React, { useState } from 'react'
import { StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { buildGcpPayload, DelegateTypes } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/exports'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import GcpAuthentication from './StepAuth/GcpAuthentication'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'

const CreateGcpConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  const isEditModeAndDelegateSelected =
    props.isEditMode &&
    (props?.connectorInfo as ConnectorInfoDTO)?.spec?.credential?.type === DelegateTypes.DELEGATE_IN_CLUSTER
  const [isDelegateRequired, setIsDelegateRequired] = useState(isEditModeAndDelegateSelected)
  const commonProps = pick(props, ['isEditMode', 'setIsEditMode', 'accountId', 'orgIdentifier', 'projectIdentifier'])
  const delegateStepName = isDelegateRequired
    ? getString('delegate.DelegateName')
    : getString('delegateSelectorOptional')

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
          mock={props.mock}
        />
        <GcpAuthentication
          name={getString('details')}
          {...commonProps}
          onConnectorCreated={props.onSuccess}
          connectorInfo={props.connectorInfo}
          setIsDelegateRequired={setIsDelegateRequired}
        />
        <DelegateSelectorStep
          name={delegateStepName}
          {...commonProps}
          buildPayload={buildGcpPayload}
          hideModal={props.onClose}
          onConnectorCreated={props.onSuccess}
          connectorInfo={props.connectorInfo}
        />
        <VerifyOutOfClusterDelegate
          name={getString('connectors.stepThreeName')}
          isStep={true}
          isLastStep={true}
          type={Connectors.GCP}
          onClose={props.onClose}
        />
      </StepWizard>
    </>
  )
}

export default CreateGcpConnector
