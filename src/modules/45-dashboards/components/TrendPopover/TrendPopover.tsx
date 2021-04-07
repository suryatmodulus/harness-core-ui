import React from 'react'
import { useState, useMemo } from 'react'
import type { SeriesColumnOptions } from 'highcharts'
import cx from 'classnames'
import { Classes, Menu, MenuItem, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Button, Layout, Popover } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import { StackedColumnChart } from '@common/components/StackedColumnChart/StackedColumnChart'
import css from './TrendPopover.module.scss'

enum TIME_RANGE_ENUMS {
  SIX_MONTHS,
  ONE_MONTH,
  ONE_WEEK,
  ONE_DAY
}

const useTimeRangeOptions = (): Record<TIME_RANGE_ENUMS, string> => {
  const { getString } = useStrings()
  return {
    [TIME_RANGE_ENUMS.SIX_MONTHS]: getString('dashboards.serviceDashboard.months'),
    [TIME_RANGE_ENUMS.ONE_MONTH]: getString('dashboards.serviceDashboard.month'),
    [TIME_RANGE_ENUMS.ONE_WEEK]: getString('dashboards.serviceDashboard.week'),
    [TIME_RANGE_ENUMS.ONE_DAY]: getString('dashboards.serviceDashboard.day')
  }
}

const TimeRangeSelector: React.FC<{ mode: TIME_RANGE_ENUMS; setMode: (mode: TIME_RANGE_ENUMS) => void }> = props => {
  const { mode, setMode } = props
  const TIME_RANGE_OPTIONS: Record<TIME_RANGE_ENUMS, string> = useMemo(useTimeRangeOptions, [])
  return (
    <Popover
      minimal
      captureDismiss
      content={
        <Menu>
          {((Object.keys(TIME_RANGE_OPTIONS) as unknown) as TIME_RANGE_ENUMS[]).map(timeRangeOptionKey => {
            return (
              <MenuItem
                text={TIME_RANGE_OPTIONS[timeRangeOptionKey]}
                onClick={() => setMode(timeRangeOptionKey)}
                key={timeRangeOptionKey}
              />
            )
          })}
        </Menu>
      }
      position={Position.BOTTOM}
    >
      <Button rightIcon="caret-down" text={TIME_RANGE_OPTIONS[mode]} minimal />
    </Popover>
  )
}

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const title = useMemo(
    () => getString('dashboards.serviceDashboard.servicesInLast', { period: TIME_RANGE_OPTIONS[mode] }),
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
