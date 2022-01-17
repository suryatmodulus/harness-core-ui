/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Column, CellProps, Renderer } from 'react-table'
import { Layout, Color, Text, Card, Icon, FontVariation, TableV2 } from '@wings-software/uicore'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import { String, useStrings } from 'framework/strings'
import type { DelegateSelectionLogParams } from 'services/portal'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import css from './DelegateSelectionLogs.module.scss'

const RenderColumnDelegateName: Renderer<CellProps<DelegateSelectionLogParams>> = ({ row }) => {
  const rowdata = row.original
  return (
    <Layout.Horizontal padding="medium" style={{ paddingLeft: 0 }} data-testid={rowdata.delegateId}>
      <Icon name={delegateTypeToIcon(rowdata.delegateType || '')} size={24} />
      <Layout.Vertical className={css.delegateName} spacing="xsmall" padding={{ left: 'xsmall' }}>
        <Text lineClamp={1} color={Color.BLACK}>
          {rowdata.delegateName}
        </Text>
        <Text lineClamp={1} color={Color.GREY_400}>
          {rowdata.delegateHostName}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const RenderConclusion: Renderer<CellProps<DelegateSelectionLogParams>> = ({ row }) => {
  const rowdata = row.original
  return (
    <Text
      rightIconProps={{ color: Color.GREEN_500 }}
      rightIcon={rowdata.conclusion === 'Selected' ? 'tick' : undefined}
    >
      {rowdata.conclusion}
    </Text>
  )
}

const RenderMessage: Renderer<CellProps<DelegateSelectionLogParams>> = ({ row }): JSX.Element => {
  const rowdata = row.original
  return (
    <Layout.Vertical spacing="xsmall" padding="medium" style={{ paddingLeft: 0 }} data-testid={rowdata.message}>
      <Text lineClamp={1} color={Color.GREY_800}>
        {rowdata.message}
      </Text>
      <Text lineClamp={1} color={Color.GREY_400} font={FontVariation.SMALL}>
        {rowdata.eventTimestamp ? (
          <String stringID="loggedAt" useRichText vars={{ time: formatDatetoLocale(rowdata.eventTimestamp) }} />
        ) : (
          '-'
        )}
      </Text>
    </Layout.Vertical>
  )
}

interface DelegateSelectionLogsTableProps {
  selectionLogs?: DelegateSelectionLogParams[]
  gotoPage: (pageNumber: number) => void
  itemCount: number
  pageSize: number
  pageCount: number
  pageIndex: number
}

export default function DelegateSelectionLogsTable({
  selectionLogs,
  gotoPage,
  itemCount,
  pageSize,
  pageCount,
  pageIndex
}: DelegateSelectionLogsTableProps): React.ReactElement {
  const { getString } = useStrings()

  const columns: Column<DelegateSelectionLogParams>[] = React.useMemo(
    () => [
      {
        accessor: 'delegateName',
        width: '35%',
        Header: getString('delegate.DelegateName').toUpperCase(),
        Cell: RenderColumnDelegateName,
        disableSortBy: true
      },
      {
        accessor: 'conclusion',
        width: '20%',
        Header: getString('assessment').toUpperCase(),
        Cell: RenderConclusion,
        disableSortBy: true
      },
      {
        accessor: 'message',
        width: '45%',
        Cell: RenderMessage,
        Header: getString('details').toUpperCase(),
        disableSortBy: true
      }
    ],
    [getString]
  )

  return (
    <Card className={css.card}>
      <TableV2<DelegateSelectionLogParams>
        columns={columns}
        data={selectionLogs || []}
        pagination={{
          itemCount,
          pageSize,
          pageCount,
          pageIndex,
          gotoPage
        }}
      />
    </Card>
  )
}
