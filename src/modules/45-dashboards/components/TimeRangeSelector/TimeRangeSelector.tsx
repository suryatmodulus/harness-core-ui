import React from 'react'
import { useMemo } from 'react'
import { Menu, MenuItem, Position } from '@blueprintjs/core'
import { Button, Popover } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './TimeRangeSelector.module.scss'

export enum TIME_RANGE_ENUMS {
  SIX_MONTHS,
  ONE_MONTH,
  ONE_WEEK,
  ONE_DAY
}

export const useTimeRangeOptions = (): Record<TIME_RANGE_ENUMS, string> => {
  const { getString } = useStrings()
  return {
    [TIME_RANGE_ENUMS.SIX_MONTHS]: getString('dashboards.serviceDashboard.months'),
    [TIME_RANGE_ENUMS.ONE_MONTH]: getString('dashboards.serviceDashboard.month'),
    [TIME_RANGE_ENUMS.ONE_WEEK]: getString('dashboards.serviceDashboard.week'),
    [TIME_RANGE_ENUMS.ONE_DAY]: getString('dashboards.serviceDashboard.day')
  }
}

export const TimeRangeSelector: React.FC<{
  mode: TIME_RANGE_ENUMS
  setMode: (mode: TIME_RANGE_ENUMS) => void
}> = props => {
  const { mode, setMode } = props
  const TIME_RANGE_OPTIONS: Record<TIME_RANGE_ENUMS, string> = useMemo(useTimeRangeOptions, [])
  return (
    <Popover
      minimal
      captureDismiss
      className={css.timeRangeSelector}
      content={
        <Menu>
          {(Object.keys(TIME_RANGE_OPTIONS) as unknown as TIME_RANGE_ENUMS[]).map(timeRangeOptionKey => {
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
      <Button
        rightIcon="caret-down"
        height={20}
        text={TIME_RANGE_OPTIONS[mode]}
        minimal
        className={css.timeRangeButton}
        font={{ size: 'xsmall' }}
      />
    </Popover>
  )
}
