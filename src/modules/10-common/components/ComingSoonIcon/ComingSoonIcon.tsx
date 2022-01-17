/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'

import css from './ComingSoonIcon.module.scss'

export interface ComingSoonIconProps {
  className?: string
  active?: boolean
}

export function ComingSoonIcon(props: ComingSoonIconProps): React.ReactElement {
  return (
    <div className={cx(css.main, { [css.active]: props.active }, props.className)}>
      <div className={css.circle1}></div>
      <div className={css.circle2}></div>
      <div className={css.circle3}></div>
    </div>
  )
}
