import React from 'react'

import css from './Separator.module.scss'

export const Separator = ({
  topSeparation = 24,
  bottomSeparation = 24
}: {
  topSeparation?: React.CSSProperties['minHeight']
  bottomSeparation?: React.CSSProperties['minHeight']
}): React.ReactElement => {
  return (
    <div>
      <div style={{ minHeight: topSeparation }}></div>
      <div className={css.separator}></div>
      <div style={{ minHeight: bottomSeparation }}></div>
    </div>
  )
}
