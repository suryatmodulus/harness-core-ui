import React, { useState } from 'react'
import { Container, Icon, Checkbox } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { Column } from './Columns'
import css from './ColumnSelector.module.scss'

interface ColumnSelectorProps {
  columns: Column[]
  selectedColumns: Column[]
  onChange: (cols: Column[]) => void
}

const ColumSelector = (props: ColumnSelectorProps): JSX.Element => {
  const { getString } = useStrings()
  const [isOpen, setIsOpen] = useState(false)
  const { columns, selectedColumns, onChange } = props

  const handleSelectOne = (column: Column): void => {
    const originalPosition = columns.indexOf(column)
    const idx = selectedColumns.indexOf(column)
    const sc =
      idx > -1
        ? [...selectedColumns.slice(0, idx), ...selectedColumns.slice(idx + 1)]
        : [...selectedColumns.slice(0, originalPosition), column, ...selectedColumns.slice(originalPosition)]

    onChange(sc)
  }

  return (
    <Container className={css.container}>
      <div className={css.selectBtn} onClick={() => setIsOpen(prev => !prev)}>
        <span>{getString('ce.gridColumnSelector')}</span>
        <Icon name="chevron-down" />
      </div>
      {isOpen && (
        <div className={css.dropDown}>
          {columns.map(column => {
            return (
              <div key={column.accessor} className={css.columnInfo}>
                <Checkbox
                  label={column.Header}
                  onClick={() => handleSelectOne(column)}
                  checked={selectedColumns.includes(column)}
                />
              </div>
            )
          })}
        </div>
      )}
    </Container>
  )
}

export default ColumSelector
