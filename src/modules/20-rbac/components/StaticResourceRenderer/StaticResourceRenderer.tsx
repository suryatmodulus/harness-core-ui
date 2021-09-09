import React, { useMemo } from 'react'
import { Button } from '@wings-software/uicore'
import type { CellProps, Column } from 'react-table'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
import Table from '@common/components/Table/Table'
import type { ResourceHandlerTableData } from '../ResourceHandlerTable/ResourceHandlerTable'

interface StaticResourceRendererProps<T extends ResourceHandlerTableData> {
  data: T[]
  columns: Column<T>[]
  onResourceSelectionChange: (resourceType: ResourceType, isAdd: boolean, identifiers?: string[] | undefined) => void
  resourceType: ResourceType
}

const StaticResourceRenderer = <T extends ResourceHandlerTableData>({
  data,
  columns,
  onResourceSelectionChange,
  resourceType
}: StaticResourceRendererProps<T>): React.ReactElement => {
  const staticResourceColumns: Column<T>[] = useMemo(
    () => [
      ...columns,
      {
        id: 'removeBtn',
        accessor: 'identifier',
        width: '5%',
        disableSortBy: true,
        // eslint-disable-next-line react/display-name
        Cell: ({ row }: CellProps<T>) => {
          return (
            <Button
              icon="trash"
              minimal
              onClick={() => {
                onResourceSelectionChange(resourceType, false, [row.original.identifier])
              }}
            />
          )
        }
      }
    ],
    [onResourceSelectionChange, resourceType]
  )

  return <Table<T> columns={staticResourceColumns} data={data} minimal hideHeaders={true} />
}

export default StaticResourceRenderer
