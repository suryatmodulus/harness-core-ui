import React from 'react'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { ToggleOnOffInterface } from './ToggleOnOff.types'
import css from './ToggleOnOff.module.scss'

export default function ToggleOnOff({
  checked = false,
  beforeOnChange,
  disabled,
  loading
}: ToggleOnOffInterface): JSX.Element {
  const [active, setActive] = React.useState<boolean>(checked)
  const { getString } = useStrings()

  return (
    <div className={cx(css.optionBtn, { [css.notAllowed]: disabled || loading })}>
      <div
        data-name="on-btn"
        className={cx(css.item, { [css.active]: active, [css.disabled]: active || disabled || loading })}
        onClick={() => {
          beforeOnChange(true, setActive)
        }}
        role="button"
      >
        {getString('common.ON')}
      </div>
      <div
        data-name="off-btn"
        className={cx(css.item, { [css.inactive]: !active, [css.disabled]: !active || disabled || loading })}
        onClick={() => {
          beforeOnChange(false, setActive)
        }}
        role="button"
      >
        {getString('common.OFF')}
      </div>
    </div>
  )
}
