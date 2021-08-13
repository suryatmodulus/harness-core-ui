import React from 'react'
import cx from 'classnames'
import { useTable, usePagination, Column, useBlockLayout, Row } from 'react-table'
import { useSticky } from 'react-table-sticky'
import { Pagination } from '@wings-software/uicore'
import css from './Grid.module.scss'

interface GridProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  showPagination?: boolean
  onRowClick?: (row: Row<T>) => void
}

const Grid = <T extends Record<string, unknown>>(props: GridProps<T>): JSX.Element => {
  const { showPagination = true, onRowClick } = props
  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 150,
      width: 150,
      maxWidth: 400
    }),
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    pageCount,
    gotoPage,
    nextPage,
    state: { pageIndex, pageSize }
  } = useTable<T>(
    {
      columns: props.columns || [],
      data: props.data || [],
      defaultColumn
    },
    usePagination,
    useBlockLayout,
    useSticky
  )

  return (
    <div className={css.gridCtn}>
      <div {...getTableProps()} className={cx(css.table, css.sticky)}>
        <div className={css.header}>
          {headerGroups.map((headerGroup, id) => (
            <div {...headerGroup.getHeaderGroupProps()} className={css.tr} key={id}>
              {headerGroup.headers.map((column, idx) => (
                <div {...column.getHeaderProps()} className={cx(css.th, (column as any).className)} key={idx}>
                  {column.render('Header')}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div {...getTableBodyProps()} className={css.body}>
          {page.map((row, idx) => {
            prepareRow(row)
            return (
              <div
                {...row.getRowProps()}
                className={css.tr}
                key={idx}
                onClick={() => {
                  onRowClick && onRowClick(row)
                }}
              >
                {row.cells.map((cell, id) => (
                  <div {...cell.getCellProps()} className={cx(css.td, (cell.column as any).className)} key={id}>
                    <div className={css.cellValue}>{cell.render('Cell')}</div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
      {showPagination && (
        <Pagination
          gotoPage={gotoPage}
          itemCount={props.data.length || 0}
          nextPage={nextPage}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
      )}
    </div>
  )
}

export default Grid
