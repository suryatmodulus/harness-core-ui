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
