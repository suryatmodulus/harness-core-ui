import React from 'react'
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Container, Icon, Checkbox, Layout } from '@wings-software/uicore'
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
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        position={Position.BOTTOM_LEFT}
        modifiers={{
          arrow: { enabled: false },
          flip: { enabled: true },
          keepTogether: { enabled: true },
          preventOverflow: { enabled: true }
        }}
        content={
          <div className={css.dropDown}>
            {columns.map(column => {
              return (
                <div key={column.accessor} className={css.columnInfo}>
                  <Checkbox
                    disabled={column.hideable === false}
                    label={column.Header}
                    onClick={() => handleSelectOne(column)}
                    checked={selectedColumns.includes(column)}
                    data-testid={`checkbox-${column.accessor}`}
                  />
                </div>
              )
            })}
          </div>
        }
      >
        <Container className={css.container}>
          <div className={css.selectBtn}>
            <span>{getString('ce.gridColumnSelector')}</span>
            <Icon name="chevron-down" />
          </div>
        </Container>
      </Popover>
    </Layout.Horizontal>
  )
}

export default ColumSelector
