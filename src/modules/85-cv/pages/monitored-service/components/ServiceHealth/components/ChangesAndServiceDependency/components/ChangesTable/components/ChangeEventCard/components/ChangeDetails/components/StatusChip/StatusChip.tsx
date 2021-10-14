import React from 'react'
import { Text } from '@wings-software/uicore'
import { ColorData } from './StatusChip.constants'
import css from './StatusChip.module.scss'

export default function StatusChip({ status }: { status: string }) {
  const { color, background } = ColorData
  return (
    <Text className={css.statusButton} color={color} border={{ color: color }} background={background}>
      {status}
    </Text>
  )
}
