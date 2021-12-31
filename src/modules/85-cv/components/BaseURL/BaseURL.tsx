import React from 'react'
import { Text, Container } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './BaseURL.module.scss'

export default function BaseURL({ path, baseURL }: { path: string; baseURL: string }): JSX.Element {
  const { getString } = useStrings()
  return (
    <>
      <Text className={css.label}>{getString('connectors.customHealth.baseURL')}</Text>
      <Container className={css.main}>
        <Text className={css.prvValue}>{baseURL}</Text>
        <Text className={css.currentValue}>{path}</Text>
      </Container>
    </>
  )
}
