import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { Connectors, CreateConnectorModalProps, TESTCONNECTION_STEP_INDEX } from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useStrings } from 'framework/strings'

// This is an old implementation of the Azure Connector creation process
// We will get rid of it once the new one is finalised.
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import AzureBillingInfo from './AzureBillingInfo'
import OldCreateServicePrincipal from './CreateServicePrincipal'

// Below is the new one:
import Overview, { CEAzureDTO } from './Steps/Overview/AzureConnectorOverview'
import Billing from './Steps/Billing/AzureConnectorBilling'
import ModalExtension from './ModalExtension'
import AzureConnectorBillingExtension from './Steps/Billing/AzureConnectorBillingExtension'
import ChooseRequirements from './Steps/CreateServicePrincipal/ChooseRequirements'
import CreateServicePrincipal from './Steps/CreateServicePrincipal/CreateServicePrincipal'
import VerifyConnection from './Steps/VerifyConnection/VerifyConnection'
import css from './CreateCeAzureConnector_new.module.scss'
import styles from './CreateCeAzureConnector.module.scss'

const CreateCeAzureConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()

  // We will get rid of this when we move to the new flow
  const showNewFlow = localStorage.getItem('NEW_AZURE_CONNECTOR_FLOW') === 'true'

  return showNewFlow ? (
    <CreateAzureConnector {...props} />
  ) : (
    <StepWizard
      icon={getConnectorIconByType(Connectors.CE_AZURE)}
      iconProps={{ size: 40 }}
      title={getString(getConnectorTitleIdByType(Connectors.CE_AZURE))}
      className={styles.azureConnector}
    >
      <ConnectorDetailsStep
        type={Connectors.CE_AZURE}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
      />
      <AzureBillingInfo {...props} name={'Azure Connection Details'} onSuccess={props.onSuccess} />
      <OldCreateServicePrincipal name={'Create Service Principal'} />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.verifyConnection')}
        onClose={props.onClose}
        isStep
        isLastStep
        type={Connectors.CE_AZURE}
        connectorInfo={props.connectorInfo}
        stepIndex={TESTCONNECTION_STEP_INDEX}
      />
    </StepWizard>
  )
}

// This has been extracted out just to test this NEW flow.
// The old flow doesn't have any test cases written.
// It will move back in above component once we have thoroughly tested
// this flow and decided to move it to GA.
export const CreateAzureConnector = (props: CreateConnectorModalProps) => {
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
