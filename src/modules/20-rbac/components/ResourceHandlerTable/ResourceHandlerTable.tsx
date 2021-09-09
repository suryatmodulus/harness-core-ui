import React, { useMemo } from 'react'
import { Checkbox, PaginationProps } from '@wings-software/uicore'
import type { CellProps, Column } from 'react-table'
import produce from 'immer'
import Table from '@common/components/Table/Table'
import css from './ResourceHandlerTable.module.scss'

interface ResourceHandlerTableProps<T extends ResourceHandlerTableData> {
  data: T[]
  columns: Column<T>[]
  selectedData?: string[]
  pagination?: PaginationProps
  onSelectChange: (items: string[]) => void
}

export interface ResourceHandlerTableData {
  identifier: string
}

const ResourceHandlerTable = <T extends ResourceHandlerTableData>(
  props: ResourceHandlerTableProps<T>
): React.ReactElement => {
  const { data, pagination, columns, onSelectChange, selectedData = [] } = props

  const handleSelectChange = (isSelect: boolean, identifier: string): void => {
    if (isSelect) onSelectChange([...selectedData, identifier])
    else
      onSelectChange(
        produce(selectedData, draft => {
          draft?.splice(draft.indexOf(identifier), 1)
        })
      )
  }

  const resourceHandlerTableColumns: Column<T>[] = useMemo(
    () => [
      {
        id: 'enabled',
        accessor: 'identifier',
        width: '5%',
        disableSortBy: true,
        // eslint-disable-next-line react/display-name
        Cell: ({ row }: CellProps<T>) => {
          return (
            <Checkbox
              className={css.checkBox}
              defaultChecked={selectedData.includes(row.original.identifier)}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                handleSelectChange(event.currentTarget.checked, row.original.identifier)
              }}
            />
          )
        }
      },
      ...columns
    ],
    [selectedData]
  )
  return (
    <Table<T>
      columns={resourceHandlerTableColumns}
      data={data}
      pagination={pagination}
      onRowClick={row => {
        handleSelectChange(!selectedData.includes(row.identifier), row.identifier)
      }}
    />
  )
}

export default ResourceHandlerTable
