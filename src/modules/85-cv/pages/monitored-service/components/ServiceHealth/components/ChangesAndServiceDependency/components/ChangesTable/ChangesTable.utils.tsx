import React from 'react'
import moment from 'moment'
import { Text } from '@wings-software/uicore'
import type { Renderer, CellProps } from 'react-table'
import { timeFormat, dateFormat } from './ChangesTable.constants'
import css from './ChangeTable.module.scss'

export const renderTime: Renderer<CellProps<any>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  const date = moment(rowdata.eventTime).format(dateFormat)
  const time = moment(rowdata.eventTime).format(timeFormat)
  return (
    <>
      <Text font={{ size: 'small' }}>{date}</Text>
      <Text font={{ size: 'xsmall' }}>{time}</Text>
    </>
  )
}

export const renderName: Renderer<CellProps<any>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  return (
    <Text tooltip={rowdata.name} font={{ size: 'small' }} className={css.changeSoureName}>
      {rowdata.name}
    </Text>
  )
}

export const renderImpact: Renderer<CellProps<any>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  return (
    <>
      <Text font={{ size: 'small' }}>{rowdata.serviceName}</Text>
      <Text font={{ size: 'xsmall' }}>{rowdata.environmentName}</Text>
    </>
  )
}

export const renderType: Renderer<CellProps<any>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  return <Text font={{ size: 'small' }}>{rowdata.type}</Text>
}

export const renderChangeType: Renderer<CellProps<any>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  return <Text font={{ size: 'small' }}>{rowdata.category}</Text>
}
