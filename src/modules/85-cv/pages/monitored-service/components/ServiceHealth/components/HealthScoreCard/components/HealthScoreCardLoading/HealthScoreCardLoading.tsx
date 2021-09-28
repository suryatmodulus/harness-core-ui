import { Classes } from '@blueprintjs/core'
import { Container } from '@wings-software/uicore'
import React from 'react'

export default function HealthScoreCardLoading(): JSX.Element {
  return (
    <Container data-testid="loading-healthscore" flex>
      <Container height={20} width={20} className={Classes.SKELETON} margin={{ right: 'small' }} />
      <Container>
        <Container height={5} width={90} className={Classes.SKELETON} margin={{ top: 'xsmall', bottom: 'xsmall' }} />
      </Container>
    </Container>
  )
}
