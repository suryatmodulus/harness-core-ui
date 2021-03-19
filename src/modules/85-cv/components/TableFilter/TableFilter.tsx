import React, { useState } from 'react'
import { debounce } from 'lodash-es'
import { TextInput, Container } from '@wings-software/uicore'
import cx from 'classnames'
import css from './TableFilter.module.scss'

export interface TableColumnWithFilterProps {
  appliedFilter?: string
  onFilter: (filterValue: string) => void
  className?: string
  placeholder?: string
  throttle?: number
}

export function TableFilter(props: TableColumnWithFilterProps): JSX.Element {
  const { appliedFilter, onFilter, className, placeholder } = props
  const [filter, setFilter] = useState<string | undefined>(appliedFilter)
  const [, setDebouncedFunc] = useState()
  return (
    <Container className={cx(css.main, className)}>
      <TextInput
        leftIcon="search"
        placeholder={placeholder}
        value={filter || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          e.persist()
          setFilter(e.target.value)
          setDebouncedFunc((prevDebounce?: any) => {
            prevDebounce?.cancel()
            const updatedDebouncedFunc = debounce(onFilter, 750)
            updatedDebouncedFunc(e.target.value)
            return updatedDebouncedFunc as any
          })
        }}
      />
    </Container>
  )
}
