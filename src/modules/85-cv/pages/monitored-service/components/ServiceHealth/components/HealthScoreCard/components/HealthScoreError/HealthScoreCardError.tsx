import { Intent } from '@blueprintjs/core'
import { Color, Container, Icon, Text } from '@wings-software/uicore'
import React from 'react'
import css from './HealthScoreCardError.module.scss'

interface HealthScoreCardErrorProps {
  errorMessage?: string
  errorMessageDetails?: string
}

export default function HealthScoreCardError(props: HealthScoreCardErrorProps): JSX.Element {
  const { errorMessage } = props
  return (
    <Container flex>
      <Icon name="warning-sign" size={12} intent={Intent.DANGER} margin={{ right: 'small' }} />
      <Text font={{ size: 'small' }} color={Color.GREY_500} className={css.errorText}>
        {errorMessage}
      </Text>
    </Container>
  )
}
