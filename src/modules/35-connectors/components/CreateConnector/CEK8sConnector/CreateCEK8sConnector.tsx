import React from 'react'
import { useState } from 'react'
import { StepWizard } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import OverviewStep from './OverviewStep'
import ProvidePermissions from './ProvidePermissions'
import FeatureSelectionStep from './FeatureSelectionStep'
import SecretCreationStep from './SecretCreationStep'

const CreateCEK8sConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  const [isOptimizationSelected, setIsOptimizationSelected] = useState<boolean>(false)
  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.CE_KUBERNETES)}
      iconProps={{ size: 40 }}
      title={getString('pipelineSteps.kubernetesInfraStep.kubernetesConnector')}
    >
      <OverviewStep
        type={Connectors.CE_KUBERNETES}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
      />
      <FeatureSelectionStep
        name="Feature Selection"
        isEditMode={props.isEditMode}
        handleOptimizationSelection={setIsOptimizationSelected}
      />
      {isOptimizationSelected ? <SecretCreationStep name="Secret Creation" /> : null}
      <ProvidePermissions {...props} name={'Provide permissions'} />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.verifyConnection')}
        onClose={props.onClose}
        isStep
        isLastStep
        type={Connectors.CE_KUBERNETES}
        connectorInfo={props.connectorInfo}
      />
    </StepWizard>
  )
}

export default CreateCEK8sConnector
