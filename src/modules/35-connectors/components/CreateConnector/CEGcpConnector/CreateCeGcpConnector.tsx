import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import DialogExtention from '@connectors/common/ConnectorExtention/DialogExtention'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useStrings } from 'framework/strings'
import OverviewStep, { CEGcpConnectorDTO } from './steps/OverviewStep'
import BillingExport from './steps/BillingExport'
import GrantPermission from './steps/GrantPermission'
import TestConnection from './steps/TestConnection'
import css from './CreateCeGcpConnector.module.scss'

const CreateCeGcpConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  return (
    <DialogExtention>
      <StepWizard
        icon={getConnectorIconByType(Connectors.CE_GCP)}
        iconProps={{ size: 40 }}
        title={getString(getConnectorTitleIdByType(Connectors.CE_GCP))}
        className={css.gcpConnector}
      >
        <OverviewStep
          name={getString('connectors.ceAws.steps.overview')}
          isEditMode={props.isEditMode}
          connectorInfo={props.connectorInfo as CEGcpConnectorDTO}
        />
        <BillingExport name={getString('connectors.ceGcp.billingExport.heading')} />
        <GrantPermission name={getString('connectors.ceGcp.grantPermission.heading')}></GrantPermission>
        <TestConnection name={getString('connectors.ceGcp.testConnection.heading')} onClose={props.onClose} />
      </StepWizard>
    </DialogExtention>
  )
}

export default CreateCeGcpConnector
