import React, { useState } from 'react'
import { StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import type { CreateConnectorModalProps } from '@connectors/constants'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { buildGcpPayload, DelegateTypes } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/exports'
import GcrAuthentication from './StepAuth/GcrAuthentication'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'

const CreateGcrConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  const commonProps = pick(props, ['isEditMode', 'setIsEditMode', 'accountId', 'orgIdentifier', 'projectIdentifier'])
  const isEditModeAndDelegateSelected =
    props.isEditMode &&
    (props?.connectorInfo as ConnectorInfoDTO)?.spec?.credential?.type === DelegateTypes.DELEGATE_IN_CLUSTER
  const [isDelegateRequired, setIsDelegateRequired] = useState(isEditModeAndDelegateSelected)
  const delegateStepName = isDelegateRequired
    ? getString('delegate.DelegateName')
    : getString('delegateSelectorOptional')
  return (
    <StepWizard
      icon={getConnectorIconByType('Gcr')}
      iconProps={{ size: 37 }}
      title={getString(getConnectorTitleIdByType('Gcr'))}
    >
      <ConnectorDetailsStep
        type={('Gcr' as unknown) as ConnectorInfoDTO['type']}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
      />
      <GcrAuthentication
        name={getString('connectors.GCR.stepTwoName')}
        {...commonProps}
        setIsDelegateRequired={setIsDelegateRequired}
      />
      <DelegateSelectorStep
        name={delegateStepName}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildGcpPayload}
        hideModal={props.onClose}
        onConnectorCreated={props.onSuccess}
        connectorInfo={props.connectorInfo}
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        isStep={true}
        isLastStep={true}
        type={'Gcr'}
        onClose={props.onClose}
      />
    </StepWizard>
  )
}

export default CreateGcrConnector
