import React from 'react'
import { pick } from 'lodash-es'
import type { Renderer, CellProps, Column } from 'react-table'
import { Utils, ReactTable } from '@wings-software/uicore'
import type { PopoverProps } from '@wings-software/uicore/dist/components/Popover/Popover'
import { NavLink } from 'react-router-dom'
import {
  getStackedSummaryBarCount,
  StackedSummaryBar,
  StackedSummaryBarData
} from '@common/components/StackedSummaryBar/StackedSummaryBar'
import { ModuleName } from 'framework/types/ModuleName'
import { loggerFor } from 'framework/logging/logging'
import css from './StackedSummaryTable.module.scss'

const logger = loggerFor(ModuleName.COMMON)

export interface StackedSummaryInterface extends StackedSummaryBarData {
  label: string
  labelLink?: string
  labelTooltip?: JSX.Element
  tooltipProps?: PopoverProps
}

export interface StackedSummaryTableProps {
  columnHeaders: (JSX.Element | string)[]
  summaryData: Array<StackedSummaryInterface>
  barLength?: number
}

export const StackedSummaryTable: React.FC<StackedSummaryTableProps> = props => {
  const { columnHeaders, summaryData, barLength } = props

  if (!summaryData[0]?.barSectionsData?.length) {
    logger.error(`Ivalid data for StackedSummaryTable, summaryData:${{ summaryData }}`)
    return null
  }

  const maxCount = getStackedSummaryBarCount(summaryData[0].barSectionsData)

  const RenderStackedSummaryBarLabelColumn: Renderer<CellProps<StackedSummaryInterface>> = ({ row }) => {
    const labelLink = row.original?.labelLink
    return (
      <Utils.WrapOptionalTooltip
        tooltip={row.original?.labelTooltip}
        tooltipProps={
          row.original?.tooltipProps ?? {
            isDark: true,
            fill: true,
            position: 'bottom'
          }
        }
      >
        {labelLink ? (
          <NavLink to={labelLink}>
            <label className={'links'}>{row.original?.label}</label>
          </NavLink>
        ) : (
          <label className={'links'}>{row.original?.label}</label>
        )}
      </Utils.WrapOptionalTooltip>
    )
  }

  const RenderStackedSummaryBarCountColumn: Renderer<CellProps<StackedSummaryInterface>> = ({ row }) => {
    return (
      <StackedSummaryBar
        maxCount={maxCount}
        barLength={barLength}
        {...pick(row.original, ['barSectionsData', 'trend', 'intent'])}
      ></StackedSummaryBar>
    )
  }

  const columns: Column<StackedSummaryInterface>[] = [
    {
      Header: () => columnHeaders[0],
      accessor: 'label',
      width: '40%',
      Cell: RenderStackedSummaryBarLabelColumn
    },
    {
      Header: () => columnHeaders[1],
      accessor: 'trend',
      width: '60%',
      Cell: RenderStackedSummaryBarCountColumn
    }
  ]

  return (
    <ReactTable<StackedSummaryInterface> columns={columns} data={summaryData} className={css.overviewSummary} minimal />
  )
}
