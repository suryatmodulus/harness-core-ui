/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
