import { Classes } from '@blueprintjs/core'
import { Container } from '@wings-software/uicore'
import React, { useMemo } from 'react'
import { NUM_OF_LOADING_BLOCKS_TO_SHOW } from './ChangesSourceLoading.constants'
import css from './ChangesSourceLoading.module.scss'

export default function ChangesSourceLoading(): JSX.Element {
  const LoadingBlock = (): JSX.Element => {
    return (
      <Container data-testid="loading-block" className={css.loadingBlock}>
        <Container height={30} width={30} className={Classes.SKELETON} margin={{ right: 'small' }} />
        <Container>
          <Container height={5} width={72} className={Classes.SKELETON} margin={{ top: 'xsmall', bottom: 'xsmall' }} />
          <Container height={5} width={28} className={Classes.SKELETON} />
        </Container>
      </Container>
    )
  }

  const loadingBlocks = useMemo(() => {
    const loadingFields: JSX.Element[] = []
    for (let i = 1; i <= NUM_OF_LOADING_BLOCKS_TO_SHOW; i++) {
      loadingFields.push(<LoadingBlock />)
    }
    return loadingFields
  }, [])

  return <Container className={css.loadingContainer}>{loadingBlocks}</Container>
}
