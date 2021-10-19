import React from 'react'
import { Table } from '@wings-software/uicore'
import type { RDSDatabase } from 'services/lw'
import { TableCell } from './common'

interface DisplaySelectedRdsDatabaseProps {
  data: RDSDatabase[]
}

export const DisplaySelectedRdsDatabse: React.FC<DisplaySelectedRdsDatabaseProps> = props => {
  return (
    <Table<RDSDatabase>
      data={props.data}
      bpTableProps={{}}
      columns={[
        {
          accessor: 'id',
          Header: 'ID',
          Cell: TableCell,
          disableSortBy: true
        },
        {
          accessor: 'region',
          Header: 'REGION',
          Cell: TableCell,
          disableSortBy: true
        }
      ]}
    />
  )
}
