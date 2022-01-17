/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

interface COFixedDrawerProps {
  content: JSX.Element
  topMargin: number
}
const COFixedDrawer: React.FC<COFixedDrawerProps> = props => {
  return (
    <div
      style={{
        top: `${props.topMargin}px`,
        boxShadow: 'rgb(40 41 61 / 4%) 0px 2px 8px, rgb(96 97 112 / 16%) 0px 16px 24px',
        width: '392px',
        bottom: 0,
        right: 0,
        position: 'fixed',
        zIndex: 20,
        backgroundColor: 'var(--white)',
        overflowY: 'scroll'
      }}
    >
      {props.content}
    </div>
  )
}

export default COFixedDrawer
