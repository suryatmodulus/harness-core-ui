import React, { useMemo } from 'react'
import type { PaginationProps } from '@wings-software/uicore'
import type { CellProps, Column } from 'react-table'
import { Checkbox } from '@blueprintjs/core'
import produce from 'immer'
import Table from '@common/components/Table/Table'

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
              defaultChecked={selectedData.includes(row.original.identifier)}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                if (event.currentTarget.checked) {
                  onSelectChange([...selectedData, row.original.identifier])
                } else {
                  onSelectChange(
                    produce(selectedData, draft => {
                      draft?.splice(draft.indexOf(row.original.identifier), 1)
                    })
                  )
                }
              }}
            />
          )
        }
      },
      ...columns
    ],
    [selectedData]
  )
  return <Table<T> columns={resourceHandlerTableColumns} data={data} pagination={pagination} />
}

export default ResourceHandlerTable
