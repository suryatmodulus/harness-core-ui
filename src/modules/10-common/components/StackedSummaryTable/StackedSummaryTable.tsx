/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { pick } from 'lodash-es'
import type { Renderer, CellProps, Column } from 'react-table'
import { TableV2, Utils } from '@wings-software/uicore'
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
  noDataRenderer?: () => JSX.Element
}

export const StackedSummaryTable: React.FC<StackedSummaryTableProps> = props => {
  const { columnHeaders, summaryData, barLength, noDataRenderer } = props

  if (!summaryData[0]?.barSectionsData?.length) {
    logger.error(`Ivalid data for StackedSummaryTable, summaryData:${{ summaryData }}`)
    if (noDataRenderer) {
      return noDataRenderer()
    }
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
    <TableV2<StackedSummaryInterface> columns={columns} data={summaryData} className={css.overviewSummary} minimal />
  )
}
