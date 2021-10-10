import React, { useMemo } from 'react'
import { Classes } from '@blueprintjs/core'
import { Container } from '@wings-software/uicore'

export default function TimelineRowLoading() {
  const LoadingBlock = () => (
    <Container width={'75px'} height={'5px'} className={Classes.SKELETON}>
      {' '}
      &nbsp;{' '}
    </Container>
  )

  const LoadingCircle = () => (
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
    <Container data-testid={'timelineLoading'} flex width={'100% !important'}>
      {loadingBlocks}
    </Container>
  )
}
