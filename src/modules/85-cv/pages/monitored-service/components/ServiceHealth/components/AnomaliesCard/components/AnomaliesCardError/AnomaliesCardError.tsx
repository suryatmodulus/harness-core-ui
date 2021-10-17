import { Intent } from '@blueprintjs/core'
import { Color, Container, Icon, Text } from '@wings-software/uicore'
import React from 'react'
import css from './AnomaliesCardError.module.scss'

interface AnomaliesCardErrorProps {
  errorMessage?: string
}

export default function AnomaliesCardError(props: AnomaliesCardErrorProps): JSX.Element {
  const { errorMessage } = props
  return (
    <Container flex>
      <Icon name="warning-sign" size={12} intent={Intent.DANGER} margin={{ right: 'small' }} />
      <Text font={{ size: 'small' }} color={Color.RED_500} className={css.errorText}>
        {errorMessage}
      </Text>
    </Container>
  )
}
