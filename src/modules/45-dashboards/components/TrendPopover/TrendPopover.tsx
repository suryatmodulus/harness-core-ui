import React from 'react'
import { useState, useMemo } from 'react'
import type { SeriesColumnOptions } from 'highcharts'
import cx from 'classnames'
import { Classes, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Button, Layout, Popover } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import { StackedColumnChart } from '@common/components/StackedColumnChart/StackedColumnChart'
import {
  TIME_RANGE_ENUMS,
  TimeRangeSelector,
  useTimeRangeOptions
} from '@dashboards/components/TimeRangeSelector/TimeRangeSelector'
import css from './TrendPopover.module.scss'

export interface TrendPopoverProps {
  data: Omit<SeriesColumnOptions, 'type'>[]
}

const getData = (data: TrendPopoverProps['data'], mode: TIME_RANGE_ENUMS): TrendPopoverProps['data'] => {
  // Todo - Jasmeet - update logic to parse data depending on mode
  if (mode === TIME_RANGE_ENUMS.SIX_MONTHS) {
    /* handle logic */
  }
  return data
}

const Trend: React.FC<TrendPopoverProps> = props => {
  const { data: propData } = props
  const [mode, setMode] = useState<TIME_RANGE_ENUMS>(TIME_RANGE_ENUMS.SIX_MONTHS)
  const { getString } = useStrings()
  const TIME_RANGE_OPTIONS: Record<TIME_RANGE_ENUMS, string> = useMemo(useTimeRangeOptions, [])
  const title = useMemo(
    () => getString('dashboards.serviceDashboard.servicesInLast', { period: TIME_RANGE_OPTIONS[mode] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode]
  )
  const data = useMemo(() => getData(propData, mode), [propData, mode])
  return (
    <Layout.Vertical padding="medium" className={css.trend}>
      <Layout.Horizontal className={css.header}>
        <div className={css.headerTitle}>{title}</div>
        <div className={css.timeRangeSelectorContainer}>
          <TimeRangeSelector mode={mode} setMode={setMode} />
        </div>
      </Layout.Horizontal>
      <StackedColumnChart data={data} options={{ chart: { height: 160 } }} />
      <Button
        minimal
        icon="cross"
        iconProps={{ size: 16 }}
        className={cx(css.trendPopoverCrossIcon, Classes.POPOVER_DISMISS)}
      />
    </Layout.Vertical>
  )
}

export const TrendPopover: React.FC<TrendPopoverProps> = props => {
  const { data, children } = props
  return (
    <Popover interactionKind={PopoverInteractionKind.CLICK} position={Position.RIGHT}>
      {children}
      <Trend data={data} />
    </Popover>
  )
}
