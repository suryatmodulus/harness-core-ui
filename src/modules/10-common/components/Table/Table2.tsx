import React from 'react'
import { useTable, Column, Row, useResizeColumns, useBlockLayout } from 'react-table'
import cx from 'classnames'

// import { PaginationProps } from '@wings-software/uicore'
import css from './Table.module.scss'

function Table({ columns, data }) {
  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 400
    }),
    []
  )

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, state, resetResizing } = useTable(
    {
      columns,
      data,
      defaultColumn
    },
    useBlockLayout,
    useResizeColumns
  )

  return (
    <>
      {/* <button onClick={resetResizing}>Reset Resizing</button> */}
      <div>
        <div {...getTableProps()} className={css.table}>
          <div>
            {headerGroups.map(headerGroup => (
              <div {...headerGroup.getHeaderGroupProps()} className={css.tr}>
                {headerGroup.headers.map(column => (
                  <div {...column.getHeaderProps()} className={css.th}>
                    {column.render('Header')}
                    {/* Use column.getResizerProps to hook up the events correctly */}
                    <div
                      {...column.getResizerProps()}
                      className={css.resizer}
                      //   className={cx(css.resizer,column.isResizing ? 'isResizing')}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row)
              return (
                <div {...row.getRowProps()} className={css.tr}>
                  {row.cells.map(cell => {
                    return (
                      <div {...cell.getCellProps()} className={css.td}>
                        {cell.render('Cell')}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <pre>
        <code>{JSON.stringify(state, null, 2)}</code>
      </pre>
    </>
  )
}

function Table2() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        columns: [
          {
            Header: 'First Name',
            accessor: 'firstName'
          },
          {
            Header: 'Last Name',
            accessor: 'lastName'
          }
        ]
      },
      {
        Header: 'Info',
        columns: [
          {
            Header: 'Age',
            accessor: 'age',
            width: 50
          },
          {
            Header: 'Visits',
            accessor: 'visits',
            width: 60
          },
          {
            Header: 'Status',
            accessor: 'status'
          },
          {
            Header: 'Profile Progress',
            accessor: 'progress'
          }
        ]
      }
    ],
    []
  )

  // const data = React.useMemo(() => makeData(10), [])

  return (
    <Table
      columns={columns}
      data={[
        {
          firstName: 'advice',
          lastName: 'sea',
          age: 10,
          visits: 55,
          progress: 63,
          status: 'complicated'
        },
        {
          firstName: 'fuel',
          lastName: 'thing',
          age: 29,
          visits: 2,
          progress: 7,
          status: 'relationship'
        },
        {
          firstName: 'look',
          lastName: 'cook',
          age: 11,
          visits: 60,
          progress: 57,
          status: 'relationship'
        },
        {
          firstName: 'inspector',
          lastName: 'toothpaste',
          age: 2,
          visits: 73,
          progress: 53,
          status: 'relationship'
        },
        {
          firstName: 'territory',
          lastName: 'sand',
          age: 15,
          visits: 59,
          progress: 2,
          status: 'single'
        },
        {
          firstName: 'inspection',
          lastName: 'combination',
          age: 18,
          visits: 55,
          progress: 79,
          status: 'single'
        },
        {
          firstName: 'coach',
          lastName: 'piano',
          age: 16,
          visits: 32,
          progress: 43,
          status: 'relationship'
        },
        {
          firstName: 'tradition',
          lastName: 'end',
          age: 1,
          visits: 49,
          progress: 20,
          status: 'complicated'
        },
        {
          firstName: 'product',
          lastName: 'potato',
          age: 21,
          visits: 90,
          progress: 22,
          status: 'complicated'
        },
        {
          firstName: 'indication',
          lastName: 'height',
          age: 3,
          visits: 89,
          progress: 2,
          status: 'single'
        }
      ]}
    />
  )
}

export default Table2
