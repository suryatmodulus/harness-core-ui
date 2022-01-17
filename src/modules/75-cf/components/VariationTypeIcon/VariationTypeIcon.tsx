/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { CFVariationColors } from '@cf/constants'

export const VariationTypeIcon = ({ style, multivariate }: { style?: React.CSSProperties; multivariate: boolean }) => {
  return (
    <span style={{ display: 'inline-block', ...style }}>
      <span
        style={{
          borderRadius: '50%',
          width: 12,
          height: 12,
          backgroundColor: CFVariationColors[0],
          display: 'inline-block'
        }}
      ></span>
      <span
        style={{
          borderRadius: '50%',
          width: 12,
          height: 12,
          backgroundColor: CFVariationColors[1],
          display: 'inline-block',
          transform: 'translateX(-4px)',
          marginRight: '2px'
        }}
      ></span>
      {multivariate && (
        <>
          <span
            style={{
              borderRadius: '50%',
              width: 12,
              height: 12,
              backgroundColor: CFVariationColors[2],
              display: 'inline-block',
              transform: 'translateX(-10px)',
              marginRight: '-4px'
            }}
          ></span>
        </>
      )}
    </span>
  )
}
