import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { useStrings } from 'framework/strings'
import AzureBillingInfo from './AzureBillingInfo'
import CreateServicePrincipal from './CreateServicePrincipal'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import css from './CreateCeAzureConnector.module.scss'

const CreateCeAzureConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.CE_AZURE)}
      iconProps={{ size: 40 }}
      title={getString(getConnectorTitleIdByType(Connectors.CE_AZURE))}
      className={css.azureConnector}
    >
      <ConnectorDetailsStep
        type={Connectors.CE_AZURE}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
      />
      <AzureBillingInfo {...props} name={'Azure Connection Details'} onSuccess={props.onSuccess} />
      <CreateServicePrincipal name={'Create Service Principal'} />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.verifyConnection')}
        onClose={props.onClose}
        isStep
        isLastStep
        type={Connectors.CE_AZURE}
        connectorInfo={props.connectorInfo}
      />
    </StepWizard>
  )
}

export default CreateCeAzureConnector
