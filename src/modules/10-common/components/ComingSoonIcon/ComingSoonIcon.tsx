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
