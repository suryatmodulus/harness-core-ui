import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useStrings } from 'framework/strings'

// This is an old implementation of the overview page of the Azure Connector creation process
// We will get rid of it once the new one is finalised.
// Contact me for any questions - akash.bhardwaj@harness.io
// import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
// import AzureBillingInfo from './AzureBillingInfo'
// import CreateServicePrincipal from './CreateServicePrincipal'
// import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
// Below is the new one:
import Overview, { CEAzureDTO } from './Steps/Overview/AzureConnectorOverview'
import Billing from './Steps/Billing/AzureConnectorBilling'
import ModalExtension from './ModalExtension'
import AzureConnectorBillingExtension from './Steps/Billing/AzureConnectorBillingExtension'
import ChooseRequirements from './Steps/CreateServicePrincipal/ChooseRequirements'
import CreateServicePrincipal from './Steps/CreateServicePrincipal/CreateServicePrincipal'
import VerifyConnection from './Steps/VerifyConnection/VerifyConnection'
import css from './CreateCeAzureConnector.module.scss'

const CreateCeAzureConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  return (
    <ModalExtension renderExtension={AzureConnectorBillingExtension}>
      <StepWizard
        icon={getConnectorIconByType(Connectors.CE_AZURE)}
        iconProps={{ size: 40 }}
        title={getString(getConnectorTitleIdByType(Connectors.CE_AZURE))}
        className={css.azureConnector}
      >
        <Overview
          type={Connectors.CE_AZURE}
          name={getString('overview')}
          isEditMode={props.isEditMode}
          connectorInfo={props.connectorInfo as CEAzureDTO}
          gitDetails={props.gitDetails}
        />
        <Billing name={getString('connectors.ceAzure.billing.heading')} />
        <ChooseRequirements name={getString('connectors.ceAzure.chooseRequirements.wizardTitle')} />
        <CreateServicePrincipal name={getString('connectors.ceAzure.servicePrincipal.heading')} />
        <VerifyConnection name={getString('connectors.ceAzure.testConnection.heading')} onClose={props.onClose} />
      </StepWizard>
    </ModalExtension>
  )
}

export default CreateCeAzureConnector
