import React from 'react'
import cx from 'classnames'
import { Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { getServicesStates } from './ServiceDependenciesLegend.utils'
import css from './ServiceDependenciesLegend.module.scss'

export default function ServiceDependenciesLegend({ className }: { className?: string }): JSX.Element {
  const { getString } = useStrings()
  const servicesStates = getServicesStates()

  return (
    <Container className={cx(css.dependenciesLegendsContainer, className)}>
      {servicesStates.map(state => {
        return (
          <Container flex key={state.identifier}>
            <Container style={{ backgroundColor: state.color }} className={css.serviceState}></Container>
            <Text margin={{ right: 'small' }} font={{ size: 'xsmall' }}>
              {getString(state.label)}
            </Text>
          </Container>
        )
      })}
    </Container>
  )
}
