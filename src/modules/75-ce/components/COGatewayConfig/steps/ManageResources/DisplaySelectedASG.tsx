import { Table } from '@wings-software/uicore'
import React from 'react'
import type { ASGMinimal } from 'services/lw'
import { NameCell, TableCell } from './common'

interface DisplaySelectedASGProps {
  data: ASGMinimal[]
}

export const DisplaySelectedASG: React.FC<DisplaySelectedASGProps> = props => {
  return (
    <Table<ASGMinimal>
      data={props.data}
      bpTableProps={{}}
      columns={[
        {
          accessor: 'name',
          Header: 'Name and ID',
          width: '16.5%',
          Cell: NameCell
        },
        {
          accessor: 'desired',
          Header: 'Instances',
          width: '10%',
          Cell: TableCell,
          disableSortBy: true
        },
        {
          accessor: 'region',
          Header: 'Region',
          width: '16.5%',
          Cell: TableCell
        }
      ]}
    />
  )
}
