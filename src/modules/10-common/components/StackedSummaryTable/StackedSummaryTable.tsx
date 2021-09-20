import React from 'react'
import { pick } from 'lodash-es'
import type { Renderer, CellProps, Column } from 'react-table'
import { Color, Text } from '@wings-software/uicore'
import {
  getStackedSummaryBarCount,
  StackedSummaryBar,
  StackedSummaryBarData
} from '@common/components/StackedSummaryBar/StackedSummaryBar'
import { ModuleName } from 'framework/types/ModuleName'
import { loggerFor } from 'framework/logging/logging'
import Table from '../Table/Table'
import css from './StackedSummaryTable.module.scss'

const logger = loggerFor(ModuleName.COMMON)

export interface StackedSummaryInterface extends StackedSummaryBarData {
  label: string
}

export interface StackedSummaryTableProps {
  columnHeaders: JSX.Element[] | string[]
  summaryData: Array<StackedSummaryInterface>
}

export const StackedSummaryTable: React.FC<StackedSummaryTableProps> = props => {
  const { columnHeaders, summaryData } = props

  if (!summaryData[0]?.barSectionsData?.length) {
    logger.error(`Ivalid data for StackedSummaryTable, summaryData:${{ summaryData }}`)
    return null
  }

  const maxCount = getStackedSummaryBarCount(summaryData[0].barSectionsData)

  const RenderStackedSummaryBarLabelColumn: Renderer<CellProps<StackedSummaryInterface>> = ({ row }) => {
    return <Text color={Color.PRIMARY_7}>{row.original?.label}</Text>
  }

  const RenderStackedSummaryBarCountColumn: Renderer<CellProps<StackedSummaryInterface>> = ({ row }) => {
    return (
      <StackedSummaryBar
        maxCount={maxCount}
        {...pick(row.original, ['barSectionsData', 'trend', 'intent'])}
      ></StackedSummaryBar>
    )
  }

  const columns: Column<StackedSummaryInterface>[] = [
    {
      Header: () => columnHeaders[0],
      accessor: 'label',
      width: '30%',
      Cell: RenderStackedSummaryBarLabelColumn
    },
    {
      Header: () => columnHeaders[1],
      accessor: 'trend',
      width: '70%',
      Cell: RenderStackedSummaryBarCountColumn
    }
  ]

  return <Table<StackedSummaryInterface> columns={columns} data={summaryData} className={css.overviewSummary} minimal />
}
