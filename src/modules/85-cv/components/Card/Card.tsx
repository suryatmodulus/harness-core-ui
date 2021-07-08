import { Container } from '@wings-software/uicore'
import React from 'react'
import css from './Card.module.scss'

interface CardProps {
  children: JSX.Element
}

export default function Card({ children }: CardProps): JSX.Element {
  return (
    <>
      <Container className={css.container}>
        <Container className={css.content}>{children}</Container>
      </Container>
    </>
  )
}
