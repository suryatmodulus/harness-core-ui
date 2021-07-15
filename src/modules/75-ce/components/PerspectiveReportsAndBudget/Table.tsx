import React from 'react'
import { useTable, Column } from 'react-table'
import css from './PerspectiveReportsAndBudgets.module.scss'

interface TableProps<T extends Record<string, any>> {
  columns: Column<T>[]
  data: T[]
  className?: string
}

const Table = <T extends Record<string, any>>(props: TableProps<T>) => {
  const { columns, data } = props
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } = useTable({ columns, data })

  return (
    <div className={css.tableCtn}>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            // eslint-disable-next-line react/jsx-key
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                // eslint-disable-next-line react/jsx-key
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row)
            return (
              // eslint-disable-next-line react/jsx-key
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  // eslint-disable-next-line react/jsx-key
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Table
