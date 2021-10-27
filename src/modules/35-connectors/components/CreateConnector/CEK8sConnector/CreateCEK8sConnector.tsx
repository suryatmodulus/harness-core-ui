import React, { useState } from 'react'
import { StepWizard } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import DialogExtention from '@connectors/common/ConnectorExtention/DialogExtention'
import OverviewStep from './OverviewStep'
import ProvidePermissions from './ProvidePermissions'
import SecretCreationStep from './SecretCreationStep'
import EnableAutostoppping from './EnableAutostopping'
import css from './CEK8sConnector.module.scss'

const CreateCEK8sConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  const [isOptimizationSelected] = useState<boolean>(false)
  return (
    <DialogExtention dialogStyles={{ width: 1159 }}>
      <StepWizard
        icon={getConnectorIconByType(Connectors.CE_KUBERNETES)}
        iconProps={{ size: 40 }}
        title={getString('pipelineSteps.kubernetesInfraStep.kubernetesConnector')}
        className={css.ceK8SConnector}
      >
        <OverviewStep
          type={Connectors.CE_KUBERNETES}
          name={getString('overview')}
          isEditMode={props.isEditMode}
          connectorInfo={props.connectorInfo}
        />
        {/* <FeatureSelectionStep
          name={getString('connectors.ceK8.enableAutostopping')}
          isEditMode={props.isEditMode}
          handleOptimizationSelection={setIsOptimizationSelected}
        /> */}
        <EnableAutostoppping
          name={getString('connectors.ceK8.enableAutostopping.title')}
          isEditMode={props.isEditMode}
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
    </DialogExtention>
  )
}

export default CreateCEK8sConnector
