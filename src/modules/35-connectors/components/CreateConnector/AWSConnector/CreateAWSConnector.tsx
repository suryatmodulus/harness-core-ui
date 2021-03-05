import React, { useState } from 'react'
import { StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import { useStrings } from 'framework/exports'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import StepAWSAuthentication from './StepAuth/StepAWSAuthentication'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { buildAWSPayload, DelegateTypes } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ConnectorInfoDTO } from 'services/cd-ng'

const CreateAWSConnector: React.FC<CreateConnectorModalProps> = props => {
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
        icon={getConnectorIconByType(Connectors.AWS)}
        iconProps={{ size: 37 }}
        title={getString(getConnectorTitleIdByType(Connectors.AWS))}
      >
        <ConnectorDetailsStep
          type={Connectors.AWS}
          name={getString('overview')}
          isEditMode={props.isEditMode}
          connectorInfo={props.connectorInfo}
          mock={props.mock}
        />
        <StepAWSAuthentication
          name={getString('credentials')}
          {...commonProps}
          onConnectorCreated={props.onSuccess}
          connectorInfo={props.connectorInfo}
          setIsDelegateRequired={setIsDelegateRequired}
        />
        <DelegateSelectorStep
          name={delegateStepName}
          {...commonProps}
          buildPayload={buildAWSPayload}
          hideModal={props.onClose}
          onConnectorCreated={props.onSuccess}
          connectorInfo={props.connectorInfo}
        />
        <VerifyOutOfClusterDelegate
          name={getString('connectors.stepThreeName')}
          isStep={true}
          isLastStep={true}
          type={Connectors.AWS}
          onClose={props.onClose}
        />
      </StepWizard>
    </>
  )
}

export default CreateAWSConnector
