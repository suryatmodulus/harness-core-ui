import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { Connectors } from '@connectors/constants'
import OverviewStep from './steps/OverviewStep'
import type { permission } from './constants'
import { CO_PERMISSION } from './constants'
import ConnectionDetailsStep from './steps/ConnectionDetailsStep'
import TestConnectionStep from './steps/TestConnectionStep'
import i18n from './AWSCOConnector.i18n'
import css from './AWSCOConnector.module.scss'

interface ConnectorConfig {
  permission?: permission
}

interface COAWSConnectorProps extends ConnectorConfig {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  onSuccess: (data?: ConnectorInfoDTO) => void | Promise<void>
  // onFailure: (data?: ConnectorRequestBody) => void | Promise<void>
}

const AWSCOConnector: React.FC<COAWSConnectorProps> = props => {
  const { onSuccess } = props
  return (
    <section className={css.wrapper}>
      <StepWizard<ConnectorInfoDTO> icon="service-aws" iconProps={{ size: 37 }} title={i18n.title}>
        <OverviewStep
          name={i18n.overview.title}
          type={Connectors.AWS_CO}
          permission={CO_PERMISSION} // TODO : ACCEPT permission from parent
        />
        <ConnectionDetailsStep name={i18n.crossAccountRole.title} />
        <TestConnectionStep name={i18n.testConnection.title} onSuccess={onSuccess} onFailure={onSuccess} />
      </StepWizard>
    </section>
  )
}

export default AWSCOConnector
