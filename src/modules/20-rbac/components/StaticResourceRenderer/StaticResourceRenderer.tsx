/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Button, TableV2 } from '@wings-software/uicore'
import type { CellProps, Column } from 'react-table'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
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
              icon="remove-minus"
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

  return <TableV2<T> columns={staticResourceColumns} data={data} minimal hideHeaders={true} />
}

export default StaticResourceRenderer
