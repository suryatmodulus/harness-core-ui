import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useStrings } from 'framework/strings'
import DialogExtention from '@connectors/common/ConnectorExtention/DialogExtention'
import OverviewStep, { CEAwsConnectorDTO } from './steps/OverviewStep'
import CostUsageStep from './steps/CostUsageReport'
import CrossAccountRoleStep1 from './steps/CrossAccountRoleStep1'
import CrossAccountRoleStep2 from './steps/CrossAccountRoleStep2'
import TestConnection from './steps/TestConnection'
import css from './CreateCeAwsConnector.module.scss'

const CreateCeAwsConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  return (
    <DialogExtention>
      <StepWizard
        icon={getConnectorIconByType(Connectors.CEAWS)}
        iconProps={{ size: 40 }}
        title={getString(getConnectorTitleIdByType(Connectors.CEAWS))}
        className={css.awsConnector}
      >
        <OverviewStep
          name={getString('connectors.ceAws.steps.overview')}
          connectorInfo={props.connectorInfo as CEAwsConnectorDTO}
          isEditMode={props.isEditMode}
        />
        <CostUsageStep name={getString('connectors.ceAws.steps.cur')} />
        <CrossAccountRoleStep1 name={getString('connectors.ceAws.steps.req')} />
        <CrossAccountRoleStep2 name={getString('connectors.ceAws.steps.roleARN')} />
        <TestConnection name={getString('connectors.ceAws.steps.test')} onClose={props.onClose} />
      </StepWizard>
    </DialogExtention>
  )
}

export default CreateCeAwsConnector
