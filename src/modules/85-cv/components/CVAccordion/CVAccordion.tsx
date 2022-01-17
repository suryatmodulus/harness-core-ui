/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
