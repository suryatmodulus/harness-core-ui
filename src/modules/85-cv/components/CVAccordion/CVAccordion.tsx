import React from 'react'
import cx from 'classnames'
import { Accordion, Container } from '@wings-software/uicore'
import css from './CVAccordion.module.scss'

export function CVAccordion(props: React.PropsWithChildren<{ className?: string }>): JSX.Element {
  const { children, className } = props
  return (
    <Container className={css.content}>
      <Accordion className={cx(css.accordian, className)}>{children}</Accordion>
    </Container>
  )
}
