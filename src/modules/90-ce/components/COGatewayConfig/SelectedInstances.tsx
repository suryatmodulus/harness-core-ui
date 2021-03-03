import React from 'react'
import type { CellProps } from 'react-table'
import { Text, Table, Color } from '@wings-software/uicore'
import type { InstanceDetails } from '@ce/components/COCreateGateway/models'
import css from './COGatewayConfig.module.scss'

interface SelectedInstanceProps {
  selected: InstanceDetails[]
}
const SelectedInstances: React.FC<SelectedInstanceProps> = props => {
  function TableCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
    return (
      <Text lineClamp={3} color={Color.BLACK}>
        {tableProps.value}
      </Text>
    )
  }
  function NameCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
    return (
      <Text lineClamp={3} color={Color.BLACK}>
        {tableProps.value} {tableProps.row.original.id}
      </Text>
    )
  }
  return (
    <Table<InstanceDetails>
      data={props.selected}
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
        }
      ]}
    />
  )
}

export default SelectedInstances
