import React from 'react'
import { Container, Heading, Text } from '@wings-software/uicore'
import { StepLabel, StepLabelProps } from '../StepLabel/StepLabel'
import css from './SetupSourceCardHeader.module.scss'

export interface SetupSourceCardHeaderProps {
  stepLabelProps: StepLabelProps
  mainHeading: string
  subHeading: string
}

export interface EmptyCardHeaderProps {
  children: React.ReactNode
}

export function SetupSourceEmptyCardHeader(props: EmptyCardHeaderProps): JSX.Element {
  const { children } = props
  return (
    <Container className={css.emptyCardHeader}>
      <Container className={css.content}>{children}</Container>
      <hr className={css.headingDivider} />
    </Container>
  )
}

export function SetupSourceCardHeader(props: SetupSourceCardHeaderProps): JSX.Element {
  const { mainHeading, subHeading, stepLabelProps } = props
  return (
    <SetupSourceEmptyCardHeader>
      <StepLabel {...stepLabelProps} />
      <Heading level={2} className={css.mainHeading}>
        {mainHeading}
      </Heading>
      <Text className={css.subHeading}>{subHeading}</Text>
    </SetupSourceEmptyCardHeader>
  )
}
