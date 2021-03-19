import React from 'react'
import { Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import {
  ConnectorSelection,
  ConnectorSelectionProps
} from '@cv/pages/onboarding/SelectOrCreateConnector/SelectOrCreateConnector'
import type { UseCreateConnectorModalProps } from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import type { StepLabelProps } from '../StepLabel/StepLabel'
import { SetupSourceCardHeader } from '../SetupSourceCardHeader/SetupSourceCardHeader'
import css from './SelectCVConnector.module.scss'

interface SelectCVConnectorProps {
  connectorTypeLabel: string
  connectorType: ConnectorSelectionProps['connectorType']
  stepLabelProps: StepLabelProps
  onCreateConnector?: UseCreateConnectorModalProps['onSuccess']
}

export function SelectCVConnector(props: SelectCVConnectorProps): JSX.Element {
  const { connectorTypeLabel, stepLabelProps, connectorType, onCreateConnector } = props
  const { getString } = useStrings()
  const connectorTypeObj = { type: connectorTypeLabel }

  return (
    <Container className={css.main}>
      <SetupSourceCardHeader
        mainHeading={getString('cv.onboarding.monitoringSources.specifyConnector', connectorTypeObj)}
        subHeading={getString('cv.onboarding.monitoringSources.firstTimeSetupText', connectorTypeObj)}
        stepLabelProps={stepLabelProps}
      />
      <Container className={css.connectorField}>
        <Text className={css.connectorLabel}>
          {getString('cv.onboarding.monitoringSources.selectConnector', connectorTypeObj)}
        </Text>
        <ConnectorSelection
          connectorType={connectorType}
          createConnectorText={getString('cv.onboarding.monitoringSources.addConnector', connectorTypeObj)}
          onSuccess={onCreateConnector}
        />
      </Container>
    </Container>
  )
}
