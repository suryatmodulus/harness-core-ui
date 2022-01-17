/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Text } from '@wings-software/uicore'
import React from 'react'
import type { Variation } from 'services/cf'
import { CFVariationColors } from '@cf/constants'

interface VariationWithIconProps {
  variation: Variation
  index: number
  iconStyle?: React.CSSProperties
  textElement?: React.ReactElement | string
  textStyle?: React.CSSProperties
}

export const VariationWithIcon: React.FC<VariationWithIconProps> = ({
  variation = {},
  index = 0,
  iconStyle,
  textElement,
  textStyle
}) => {
  const { name, value } = variation

  return (
    <>
      <span
        style={{
          borderRadius: '50%',
          width: 12,
          height: 12,
          backgroundColor: CFVariationColors[index % CFVariationColors.length],
          display: 'inline-block',
          ...iconStyle
        }}
      ></span>
      <Text inline margin={{ bottom: 'xsmall' }} style={{ marginBottom: 0, ...textStyle }}>
        {textElement || name || value}
      </Text>
    </>
  )
}
