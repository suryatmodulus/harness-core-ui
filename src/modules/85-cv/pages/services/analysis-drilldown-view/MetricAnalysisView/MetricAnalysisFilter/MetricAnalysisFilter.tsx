import React, { useState } from 'react'
import { Container, Text, Select, Color, SelectOption, SelectProps } from '@wings-software/uicore'
import cx from 'classnames'
import { debounce } from 'lodash-es'
import i18n from './MetricAnalysisFilter.i18n'
import css from './MetricAnalysisFilter.module.scss'

export const MetricAnalysisFilterType = {
  ANOMALOUS: 'ANOMALOUS',
  ALL_METRICS: 'ALL_METRICS'
}

export const FILTER_OPTIONS: SelectOption[] = [
  {
    label: i18n.filterByDropdownOptionLabels.anomalous,
    value: MetricAnalysisFilterType.ANOMALOUS
  },
  {
    label: i18n.filterByDropdownOptionLabels.allMetrics,
    value: MetricAnalysisFilterType.ALL_METRICS
  }
]

interface MetricAnalysisFilterProps {
  onChangeFilter?: (updatedOption: string) => void
  defaultFilterValue?: SelectOption
  onFilterDebounceTime?: number
  onFilter?: (filterValue: string) => void
  className?: string
}

export function MetricAnalysisFilter(props: MetricAnalysisFilterProps): JSX.Element {
  const { onChangeFilter, defaultFilterValue, onFilter, onFilterDebounceTime, className } = props
  const [selectedOption, setSelectedOption] = useState(defaultFilterValue || FILTER_OPTIONS[0])
  const [, setDebouncedFunc] = useState<typeof debounce | undefined>()
  const [filterValue, setFilterValue] = useState<string | undefined>()

  return (
    <Container className={cx(css.main, className)}>
      <Container className={css.filterOptionContainer}>
        <Text color={Color.BLACK} font={{ size: 'small' }}>
          {i18n.filterText}
        </Text>
        <Select
          items={FILTER_OPTIONS}
          value={selectedOption}
          className={css.filterByOptions}
          onChange={(selectedItem: SelectOption) => {
            if (selectedItem?.value !== selectedOption?.value) {
              setSelectedOption(selectedItem)
              onChangeFilter?.(selectedItem.value as string)
            }
          }}
          size={'small' as SelectProps['size']}
        />
      </Container>
      <input
        className={css.filterInput}
        placeholder={i18n.searchInputPlaceholderText}
        value={filterValue}
        onChange={e => {
          e.persist()
          setFilterValue(e.target.value)
          setDebouncedFunc((prevDebounce?: any) => {
            prevDebounce?.cancel()
            if (!onFilter) return
            const debouncedFunc = debounce(onFilter, onFilterDebounceTime || 500)
            debouncedFunc(e.target.value)
            return debouncedFunc as any
          })
        }}
      />
    </Container>
  )
}
