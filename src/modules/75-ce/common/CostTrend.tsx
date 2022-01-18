/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, IconName, Text } from '@wings-software/uicore'

interface TrendProps {
  value: number
  downIcon?: string
  upIcon?: string
  iconSize?: number
  flipColors?: boolean
}

const CostTrend = (props: TrendProps) => {
  const { iconSize = 16, value = 0, downIcon = 'caret-down', upIcon = 'caret-up', flipColors } = props

  const v = +value
  let icon: Record<string, string | undefined> = { name: undefined, color: undefined } // when v = 0

  if (v < 0) {
    icon = { name: downIcon, color: flipColors ? Color.RED_500 : Color.GREEN_500 }
  } else if (v > 0) {
    icon = { name: upIcon, color: flipColors ? Color.GREEN_500 : Color.RED_500 }
  }

  return (
    <Text
      font="small"
      color="grey700"
      inline
      icon={icon.name as IconName}
      iconProps={{ size: iconSize, color: icon.color }}
    >
      {v ? `${Math.abs(v)}%` : '—'}
    </Text>
  )
}

export default CostTrend
