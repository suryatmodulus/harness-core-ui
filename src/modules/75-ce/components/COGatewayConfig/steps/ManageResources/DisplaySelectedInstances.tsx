import React from 'react'
import type { CellProps } from 'react-table'
import { Button, Table } from '@wings-software/uicore'
import type { InstanceDetails } from '@ce/components/COCreateGateway/models'
import { NameCell, TableCell } from './common'
import css from '../../COGatewayConfig.module.scss'

interface DisplaySelectedInstancesProps {
  data: InstanceDetails[]
  onDelete: (index: number) => void
}

export const DisplaySelectedInstances: React.FC<DisplaySelectedInstancesProps> = props => {
  const RemoveCell = (tableProps: CellProps<InstanceDetails>) => {
    return <Button className={css.clearBtn} icon={'delete'} onClick={() => props.onDelete(tableProps.row.index)} />
  }
  return (
    <Table<InstanceDetails>
      data={props.data}
      bpTableProps={{}}
      className={css.instanceTable}
      columns={[
        {
          accessor: 'name',
          Header: 'NAME AND ID',
          width: '16.5%',
          Cell: NameCell
        },
        {
          accessor: 'ipv4',
          Header: 'IP ADDRESS',
          width: '16.5%',
          Cell: TableCell,
          disableSortBy: true
        },
        {
          accessor: 'region',
          Header: 'REGION',
          width: '16.5%',
          Cell: TableCell
        },
        {
          accessor: 'type',
          Header: 'TYPE',
          width: '16.5%',
          Cell: TableCell
        },
        {
          accessor: 'tags',
          Header: 'TAGS',
          width: '16.5%',
          Cell: TableCell
        },
        {
          accessor: 'launch_time',
          Header: 'LAUNCH TIME',
          width: '16.5%',
          Cell: TableCell
        },
        {
          accessor: 'status',
          Header: 'STATUS',
          width: '16.5%',
          Cell: TableCell
        },
        {
          Header: '',
          id: 'menu',
          accessor: row => row.id,
          width: '5%',
          Cell: RemoveCell,
          disableSortBy: true
        }
      ]}
    />
  )
}
