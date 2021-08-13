import React from 'react'
import { Text, Container } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './ServiceInstanceLabel.module.scss'

export function ServiceInstanceLabel(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container className={css.main}>
      <Text className={css.primaryLabel}>{`${getString('cv.monitoringSources.serviceInstanceIdentifier')}`}</Text>
      <Text className={css.secondaryLabel}>{`${getString('cv.monitoringSources.optionalServiceInstanceLabel')}`}</Text>
    </Container>
  )
}
