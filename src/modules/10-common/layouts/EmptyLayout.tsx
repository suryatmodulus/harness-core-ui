import React from 'react'

import css from './layouts.module.scss'

// eslint-disable-next-line @typescript-eslint/ban-types
export function EmptyLayout(props: React.PropsWithChildren<{}>): React.ReactElement {
  return (
    <div className={css.children} data-layout="empty">
      {props.children}
    </div>
  )
}
