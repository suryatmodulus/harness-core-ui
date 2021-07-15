import React from 'react'

import css from './Badge.module.scss'

export function Badge(props: React.PropsWithChildren<unknown>): React.ReactElement {
  return <div className={css.badge}>{props.children}</div>
}
