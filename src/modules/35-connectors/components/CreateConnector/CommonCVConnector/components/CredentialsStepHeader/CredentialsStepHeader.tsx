import React from 'react'
import { Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './CredentialsStepHeader.module.scss'

export interface StepDetailsHeader {
  connectorTypeLabel: string
  subheading?: string
}

export function StepDetailsHeader(props: StepDetailsHeader): JSX.Element {
  const { connectorTypeLabel, subheading } = props
  const { getString } = useStrings()
  const stringsTitleObject = { type: connectorTypeLabel }
  return (
    <Container className={css.titleContent}>
      <Text className={css.title}>{getString('connectors.connectorDetailsHeader', stringsTitleObject)}</Text>
      <Text className={css.heading}>{getString('connectors.addConnectorDetails', stringsTitleObject)}</Text>
      {subheading && <Text className={css.subHeading}>{subheading}</Text>}
    </Container>
  )
}
