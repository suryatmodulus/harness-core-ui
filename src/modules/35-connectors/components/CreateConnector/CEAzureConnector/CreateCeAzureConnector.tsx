import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useStrings } from 'framework/strings'

import Overview, { CEAzureDTO } from './Steps/Overview/AzureConnectorOverview'
import Billing from './Steps/Billing/AzureConnectorBilling'
import ModalExtension from './ModalExtension'
import AzureConnectorBillingExtension from './Steps/Billing/AzureConnectorBillingExtension'
import ChooseRequirements from './Steps/CreateServicePrincipal/ChooseRequirements'
import CreateServicePrincipal from './Steps/CreateServicePrincipal/CreateServicePrincipal'
import VerifyConnection from './Steps/VerifyConnection/VerifyConnection'
import css from './CreateCeAzureConnector_new.module.scss'

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
          name={getString('connectors.ceAzure.steps.overview')}
          isEditMode={props.isEditMode}
          connectorInfo={props.connectorInfo as CEAzureDTO}
          gitDetails={props.gitDetails}
        />
        <Billing name={getString('connectors.ceAzure.steps.billingExports')} />
        <ChooseRequirements name={getString('connectors.ceAzure.steps.requirements')} />
        <CreateServicePrincipal name={getString('connectors.ceAzure.steps.servicePrincipal')} />
        <VerifyConnection name={getString('connectors.ceAzure.steps.testConnection')} onClose={props.onClose} />
      </StepWizard>
    </ModalExtension>
  )
}

export default CreateCeAzureConnector
