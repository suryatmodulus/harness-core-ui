import React, { useState } from 'react'
import { SelectV2, SelectOption, Text, Container } from '@wings-software/uicore'
import styles from './RangeSelector.module.scss'

export const rangeOptions = [
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 60 days', value: 60 },
  { label: 'Last 7 days', value: 7 }
]

export interface RangeSelectorProps {
  defaultOption?: SelectOption
  onRangeSelected?(range: number[]): void
}

export interface RangeSelectorWithTitleProps extends RangeSelectorProps {
  title: React.ReactNode
}

export default function RangeSelector({ defaultOption = rangeOptions[0], onRangeSelected }: RangeSelectorProps) {
  const [option, setOption] = useState(defaultOption)
  return (
    <SelectV2
      className={styles.rangeSelector}
      items={rangeOptions}
      filterable={false}
      onChange={opt => {
        setOption(opt)
        const now = Date.now()
        onRangeSelected?.([now - (opt.value as number) * 24 * 60 * 60 * 1000, now])
      }}
    >
      <Text font={{ size: 'xsmall' }} padding={{ top: 'xsmall', bottom: 'xsmall' }} rightIcon="chevron-down">
        {option.label}
      </Text>
    </SelectV2>
  )
}

export function RangeSelectorWithTitle({ defaultOption, onRangeSelected, title }: RangeSelectorWithTitleProps) {
  return (
    <Container className={styles.titleAndFilter}>
      <Text>{title}</Text>
      <RangeSelector defaultOption={defaultOption} onRangeSelected={onRangeSelected} />
    </Container>
  )
}
