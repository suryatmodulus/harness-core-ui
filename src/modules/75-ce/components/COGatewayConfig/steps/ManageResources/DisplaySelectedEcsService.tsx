import React from 'react'
import { Table } from '@wings-software/uicore'
import type { ContainerSvc } from 'services/lw'
import { TableCell } from './common'

interface DisplaySelectedEcsServiceProps {
  data: ContainerSvc[]
}

export const DisplaySelectedEcsService: React.FC<DisplaySelectedEcsServiceProps> = props => {
  return (
    <Table<ContainerSvc>
      data={props.data}
      bpTableProps={{}}
      columns={[
        {
          accessor: 'cluster',
          Header: 'Cluster',
          width: '10%',
          Cell: TableCell,
          disableSortBy: true
        },
        {
          accessor: 'service',
          Header: 'Service',
          width: '10%',
          Cell: TableCell,
          disableSortBy: true
        },
        {
          accessor: 'region',
          Header: 'Region',
          width: '16.5%',
          Cell: TableCell
        },
        {
          accessor: 'task_count',
          Header: 'Current Task Count',
          width: '10%',
          Cell: TableCell,
          disableSortBy: true
        }
      ]}
    />
  )
}
