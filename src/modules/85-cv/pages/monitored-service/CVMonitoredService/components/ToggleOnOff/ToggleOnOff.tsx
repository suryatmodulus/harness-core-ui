/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { ToggleOnOffInterface } from './ToggleOnOff.types'
import css from './ToggleOnOff.module.scss'

export default function ToggleOnOff({
  checked = false,
  onChange,
  disabled,
  loading
}: ToggleOnOffInterface): JSX.Element {
  const { getString } = useStrings()

  return (
    <div className={cx(css.optionBtn, { [css.notAllowed]: disabled || loading })}>
      <div
        data-name="on-btn"
        className={cx(css.item, { [css.active]: checked, [css.disabled]: checked || disabled || loading })}
        onClick={() => {
          !disabled && onChange(true)
        }}
        role="button"
      >
        {getString('common.ON')}
      </div>
      <div
        data-name="off-btn"
        className={cx(css.item, { [css.inactive]: !checked, [css.disabled]: !checked || disabled || loading })}
        onClick={() => {
          !disabled && onChange(false)
        }}
        role="button"
      >
        {getString('common.OFF')}
      </div>
    </div>
  )
}
