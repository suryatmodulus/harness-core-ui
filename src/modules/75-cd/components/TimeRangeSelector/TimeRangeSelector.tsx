import React, { useState } from 'react'
import moment from 'moment'
import cx from 'classnames'
import { Position } from '@blueprintjs/core'
import { DateRange, DateRangePicker, IDateRangeShortcut } from '@blueprintjs/datetime'
import { Button, Popover } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './TimeRangeSelector.module.scss'

// Todo - Jasmeet - change return values once API is fixed
export const getBucketSizeForTimeRange = (timeRange?: DateRange): number => {
  if (timeRange) {
    /**/
  }
  return 1
}

export const startOfDay = (time: moment.Moment): Date => time.utc().startOf('day').toDate()

export interface TimeRangeSelectorProps {
  range: DateRange
  label: string
}

const dateFormat = 'DD MMMM YYYY'

export const TimeRangeSelector: React.FC<{
  timeRange?: DateRange
  setTimeRange: (data: TimeRangeSelectorProps) => void
  minimal?: boolean
}> = props => {
  const { timeRange, setTimeRange, minimal = false } = props
  const { getString } = useStrings()
  const dateRangeShortcuts = [
    {
      dateRange: [startOfDay(moment().subtract(7, 'days')), startOfDay(moment())],
      label: getString('common.last7days'),
      includeTime: true
    },
    {
      dateRange: [startOfDay(moment().subtract(30, 'days')), startOfDay(moment())],
      label: getString('cd.serviceDashboard.month'),
      includeTime: true
    },
    {
      dateRange: [startOfDay(moment().subtract(3, 'month')), startOfDay(moment())],
      label: getString('cd.serviceDashboard.3months'),
      includeTime: true
    },
    {
      dateRange: [startOfDay(moment().subtract(6, 'month')), startOfDay(moment())],
      label: getString('cd.serviceDashboard.6months'),
      includeTime: true
    },
    {
      dateRange: [startOfDay(moment().subtract(1, 'year')), startOfDay(moment())],
      label: getString('cd.serviceDashboard.year'),
      includeTime: true
    }
  ] as IDateRangeShortcut[]

  const getLabel = (range?: DateRange): string => {
    if (!range) {
      return ''
    }
    const shortcutLabel = dateRangeShortcuts.filter(
      dateRangeShortcut =>
        dateRangeShortcut.dateRange[0]?.getTime() === range[0]?.getTime() &&
        dateRangeShortcut.dateRange[1]?.getTime() === range[1]?.getTime()
    )
    if (shortcutLabel.length) {
      return shortcutLabel[0].label
    }
    return `${moment(range[0]?.valueOf()).format(dateFormat)} - ${moment(range[1]?.valueOf()).format(dateFormat)}`
  }

  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState<boolean>(false)
  const [selectedRange, setSelectedRange] = useState<DateRange>(timeRange || dateRangeShortcuts[3].dateRange)

  return (
    <Popover
      minimal
      captureDismiss
      className={cx(css.timeRangeSelector, { [css.nonMinimalStyles]: !minimal })}
      position={Position.BOTTOM_RIGHT}
      isOpen={isDateRangePickerOpen}
    >
      <Button
        rightIcon="caret-down"
        height={20}
        text={getLabel(selectedRange)}
        onClick={() => setIsDateRangePickerOpen(!isDateRangePickerOpen)}
        minimal
        className={css.timeRangeButton}
        font={{ size: 'xsmall' }}
      />
      <DateRangePicker
        className={css.dateRangePicker}
        maxDate={new Date()}
        defaultValue={selectedRange}
        shortcuts={dateRangeShortcuts}
        onChange={range => {
          if (range[0] && range[1]) {
            const label = getLabel(range)
            setSelectedRange(range)
            setTimeRange({ range, label })
            setIsDateRangePickerOpen(false)
          }
        }}
        allowSingleDayRange
      />
    </Popover>
  )
}
