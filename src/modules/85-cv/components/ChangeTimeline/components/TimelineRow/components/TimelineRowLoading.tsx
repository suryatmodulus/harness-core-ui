import React, { useMemo } from 'react'
import { Classes } from '@blueprintjs/core'
import { Container } from '@wings-software/uicore'
import css from './TimelineRowLoading.module.scss'

export default function TimelineRowLoading(): JSX.Element {
  const LoadingBlock = (): JSX.Element => (
    <Container width={'75px'} height={'5px'} className={Classes.SKELETON}>
      {' '}
      &nbsp;{' '}
    </Container>
  )

  const LoadingCircle = (): JSX.Element => (
    <Container width={'7px'} height={'7px'} style={{ borderRadius: '4px' }} className={Classes.SKELETON}>
      {' '}
      &nbsp;{' '}
    </Container>
  )

  const loadingBlocks = useMemo(() => {
    const loadingFields: JSX.Element[] = []
    for (let i = 1; i <= 14; i++) {
      loadingFields.push(
        <>
          <LoadingBlock key={`${i}block`} />
          {i < 14 && <LoadingCircle key={`${i}circle`} />}
        </>
      )
    }
    return loadingFields
  }, [])
  return (
    <Container data-testid={'timelineLoading'} flex className={css.loadingContainer}>
      {loadingBlocks}
    </Container>
  )
}
