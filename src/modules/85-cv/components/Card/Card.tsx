import { Container } from '@wings-software/uicore'
import React from 'react'
import classNames from 'classnames'

import css from './Card.module.scss'

interface CardProps {
  children: JSX.Element
  className?: string
  contentClassName?: string
}

export default function Card({ children, className, contentClassName }: CardProps): JSX.Element {
  return (
    <Container className={classNames(className, css.container)}>
      <Container className={classNames(contentClassName, css.content)}>{children}</Container>
    </Container>
  )
}
