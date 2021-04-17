import React from 'react'

import MainNav from '@common/navigation/MainNav'

import css from './layouts.module.scss'

// eslint-disable-next-line @typescript-eslint/ban-types
export function MinimalLayout(props: React.PropsWithChildren<{}>): React.ReactElement {
  return (
    <div className={css.main} data-layout="minimal">
      <MainNav />
      <div className={css.children}>{props.children}</div>
    </div>
  )
}
