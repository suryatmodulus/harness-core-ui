import React from 'react'
import { Color, Text } from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import type { InstanceDetails } from '@ce/components/COCreateGateway/models'

export const TableCell = (tableProps: CellProps<InstanceDetails>): JSX.Element => {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {tableProps.value}
    </Text>
  )
}
export const NameCell = (tableProps: CellProps<InstanceDetails>): JSX.Element => {
  return (
    <Text lineClamp={3} color={Color.BLACK} style={{ overflowWrap: 'anywhere' }}>
      {tableProps.value} {tableProps.row.original.id}
    </Text>
  )
}
