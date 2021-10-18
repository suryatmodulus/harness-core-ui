import React from 'react'
import { Text, Color } from '@wings-software/uicore'
import { ColorData } from './StatusChip.constants'
import css from './StatusChip.module.scss'

export default function StatusChip({
  status,
  color,
  backgroundColor
}: {
  status: string
  color?: Color
  backgroundColor?: Color
}): JSX.Element {
  return (
    <Text
      className={css.statusButton}
      color={color}
      border={{ color: color || ColorData.color }}
      background={backgroundColor || ColorData.background}
    >
      {status}
    </Text>
  )
}
