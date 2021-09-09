import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { Connectors } from '@connectors/constants'
import { getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { buildArgoConnectorPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import ProviderOverviewStep from '../ProviderDetailsStep/ProviderDetailsStep'
import TestConnection from '../TestConnection/TestConnection'

import css from './CreateArgoProvider.module.scss'

interface CreateArgoProviderProps {
  isEditMode?: boolean
  provider?: any
  connectorInfo?: any
  mock?: any
  onClose?: void
}

const CreateArgoProvider: React.FC<CreateArgoProviderProps> = props => {
  const { getString } = useStrings()
  const { provider } = props

  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.ARGO)}
      iconProps={{ size: 50 }}
      title={'Argo Provider'}
      className={css.stepWizard}
    >
      <ConnectorDetailsStep
        type={Connectors.ARGO}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.provider}
        mock={props.mock}
      />
      <ProviderOverviewStep
        provider={provider}
        isEditMode={props.isEditMode}
        name={getString('cd.providerDetails')}
        buildPayload={buildArgoConnectorPayload}
      />
      <TestConnection onClose={props.onClose} name={getString('common.labelTestConnection')} />
    </StepWizard>
  )
}

export default CreateArgoProvider
