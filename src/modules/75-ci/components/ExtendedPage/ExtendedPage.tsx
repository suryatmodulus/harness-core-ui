/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import classNames from 'classnames'
import type { DivAttributesProps } from '../common/props'
import css from './ExtendedPage.module.scss'

export interface ExtendedPageProps extends DivAttributesProps {
  className?: string
}

const ExtendedPage: React.FC<ExtendedPageProps> = props => {
  const { className, children, ...restProps } = props

  return (
    <div className={classNames(css.main, className)} {...restProps}>
      {children}
    </div>
  )
}

export default ExtendedPage
