import React from 'react'
import { StepWizard } from '@wings-software/uicore'

import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import { useStrings } from 'framework/exports'
import type { ConnectorInfoDTO, ConnectorRequestBody } from 'services/cd-ng'

import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import AwsKmsConfigForm from './views/AwsKmsConfigForm'
import css from './CreateAwsKmsConnector.module.scss'

export interface CreateAwsKmsConnectorProps {
  onClose: () => void
  onSuccess: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  mock?: any
  connectorInfo?: ConnectorInfoDTO | void
}

export interface StepSecretManagerProps extends ConnectorInfoDTO {
  isEdit: boolean
  spec: any
}

const CreateAwsKmsConnector: React.FC<CreateAwsKmsConnectorProps> = props => {
  const { onClose, onSuccess } = props
  const { getString } = useStrings()
  return (
    <StepWizard<StepSecretManagerProps>
      icon={getConnectorIconByType(Connectors.AWS_KMS)}
      iconProps={{ size: 37 }}
      title={getString(getConnectorTitleIdByType(Connectors.AWS_KMS))}
      className={css.wizardNav}
    >
      <ConnectorDetailsStep
        type={Connectors.AWS_KMS}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
      />
      <AwsKmsConfigForm
        name={getString('details')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        {...props}
        onSuccess={onSuccess}
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        isStep
        onClose={onClose}
        isLastStep={true}
        type={Connectors.AWS_KMS}
      />
    </StepWizard>
  )
}

export default CreateAwsKmsConnector
