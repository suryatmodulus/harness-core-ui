import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import { getConnectorTitleIdByType, getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { buildKubPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/exports'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import Stepk8ClusterDetails from './StepAuth/Stepk8ClusterDetails'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'

const CreateK8sConnector: React.FC<CreateConnectorModalProps> = props => {
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
      icon={getConnectorIconByType(Connectors.KUBERNETES_CLUSTER)}
      iconProps={{ size: 50 }}
      title={getString(getConnectorTitleIdByType(Connectors.KUBERNETES_CLUSTER))}
    >
      <ConnectorDetailsStep
        type={Connectors.KUBERNETES_CLUSTER}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
      />
      <Stepk8ClusterDetails
        name={getString('details')}
        onConnectorCreated={props.onSuccess}
        hideModal={props.onClose}
        {...commonProps}
      />
      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildKubPayload}
        onConnectorCreated={props.onSuccess}
        connectorInfo={props.connectorInfo}
        hideModal={props.onClose}
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        isStep
        isLastStep={true}
        type={Connectors.KUBERNETES_CLUSTER}
        onClose={props.onClose}
        setIsEditMode={props.setIsEditMode}
      />
    </StepWizard>
  )
}

export default CreateK8sConnector
