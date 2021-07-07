import React, { useState } from 'react'
import { Layout, Text, Button, Container } from '@wings-software/uicore'
import { DateRangePicker } from '@blueprintjs/datetime'
import moment from 'moment'
import { Popover, Position, Classes } from '@blueprintjs/core'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { DATE_RANGE_SHORTCUTS, DATE_RANGE_SHORTCUTS_NAME, CE_DATE_FORMAT_INTERNAL } from '@ce/utils/momentUtils'
import css from './PerspectiveTimeRangePicker.module.scss'

const getDateLabelToDisplayText: (getString: UseStringsReturn['getString']) => Record<string, string> = getString => {
  return {
    [DATE_RANGE_SHORTCUTS_NAME.LAST_7_DAYS]: getString('ce.perspectives.timeRangeConstants.last7Days'),
    [DATE_RANGE_SHORTCUTS_NAME.CURRENT_MONTH]: getString('ce.perspectives.timeRangeConstants.thisMonth'),
    [DATE_RANGE_SHORTCUTS_NAME.LAST_30_DAYS]: getString('ce.perspectives.timeRangeConstants.last30Days'),
    [DATE_RANGE_SHORTCUTS_NAME.THIS_QUARTER]: getString('ce.perspectives.timeRangeConstants.thisQuarter'),
    [DATE_RANGE_SHORTCUTS_NAME.THIS_YEAR]: getString('ce.perspectives.timeRangeConstants.thisYear'),
    [DATE_RANGE_SHORTCUTS_NAME.LAST_MONTH]: getString('ce.perspectives.timeRangeConstants.lastMonth'),
    [DATE_RANGE_SHORTCUTS_NAME.LAST_QUARTER]: getString('ce.perspectives.timeRangeConstants.lastQuarter'),
    [DATE_RANGE_SHORTCUTS_NAME.LAST_YEAR]: getString('ce.perspectives.timeRangeConstants.lastYear'),
    [DATE_RANGE_SHORTCUTS_NAME.LAST_3_MONTHS]: getString('ce.perspectives.timeRangeConstants.last3Months'),
    [DATE_RANGE_SHORTCUTS_NAME.LAST_6_MONTHS]: getString('ce.perspectives.timeRangeConstants.last6Months'),
    [DATE_RANGE_SHORTCUTS_NAME.LAST_12_MONTHS]: getString('ce.perspectives.timeRangeConstants.last12Months')
  }
}

const RECOMMENDED_DATES = [
  {
    label: DATE_RANGE_SHORTCUTS_NAME.LAST_7_DAYS,
    dateRange: DATE_RANGE_SHORTCUTS.LAST_7_DAYS,
    dateFormat: ['MMM D', 'MMM D']
  },
  {
    label: DATE_RANGE_SHORTCUTS_NAME.CURRENT_MONTH,
    dateRange: DATE_RANGE_SHORTCUTS.CURRENT_MONTH,
    dateFormat: ['MMM YYYY']
  }
]

const RELATIVE_DATES = [
  {
    label: DATE_RANGE_SHORTCUTS_NAME.LAST_7_DAYS,
    dateRange: DATE_RANGE_SHORTCUTS.LAST_7_DAYS,
    dateFormat: ['MMM D', 'MMM D']
  },
  {
    label: DATE_RANGE_SHORTCUTS_NAME.LAST_30_DAYS,
    dateRange: DATE_RANGE_SHORTCUTS.LAST_30_DAYS,
    dateFormat: ['MMM D', 'MMM D']
  }
]

const CALENDAR_MONTH_DATES = [
  {
    label: DATE_RANGE_SHORTCUTS_NAME.CURRENT_MONTH,
    dateRange: DATE_RANGE_SHORTCUTS.CURRENT_MONTH,
    dateFormat: ['MMM YYYY']
  },
  {
    label: DATE_RANGE_SHORTCUTS_NAME.THIS_QUARTER,
    dateRange: DATE_RANGE_SHORTCUTS.THIS_QUARTER,
    dateFormat: ['MMM', 'MMM YYYY']
  },
  { label: DATE_RANGE_SHORTCUTS_NAME.THIS_YEAR, dateRange: DATE_RANGE_SHORTCUTS.THIS_YEAR, dateFormat: ['YYYY'] },
  { label: DATE_RANGE_SHORTCUTS_NAME.LAST_MONTH, dateRange: DATE_RANGE_SHORTCUTS.LAST_MONTH, dateFormat: ['MMM YYYY'] },
  {
    label: DATE_RANGE_SHORTCUTS_NAME.LAST_QUARTER,
    dateRange: DATE_RANGE_SHORTCUTS.LAST_QUARTER,
    dateFormat: ['MMM', 'MMM YYYY']
  },
  { label: DATE_RANGE_SHORTCUTS_NAME.LAST_YEAR, dateRange: DATE_RANGE_SHORTCUTS.LAST_YEAR, dateFormat: ['YYYY'] },
  {
    label: DATE_RANGE_SHORTCUTS_NAME.LAST_3_MONTHS,
    dateRange: DATE_RANGE_SHORTCUTS.LAST_3_MONTHS,
    dateFormat: ['MMM YYYY', 'MMM YYYY']
  },
  {
    label: DATE_RANGE_SHORTCUTS_NAME.LAST_6_MONTHS,
    dateRange: DATE_RANGE_SHORTCUTS.LAST_6_MONTHS,
    dateFormat: ['MMM YYYY', 'MMM YYYY']
  },
  {
    label: DATE_RANGE_SHORTCUTS_NAME.LAST_12_MONTHS,
    dateRange: DATE_RANGE_SHORTCUTS.LAST_12_MONTHS,
    dateFormat: ['MMM YYYY', 'MMM YYYY']
  }
]

interface DateLabelRendererProps {
  text: DATE_RANGE_SHORTCUTS_NAME
  dateRange: moment.Moment[]
  dateFormat: string[]
  onClick: () => void
}

const DateLabelRenderer: React.FC<DateLabelRendererProps> = ({ text, dateRange, dateFormat, onClick }) => {
  const { getString } = useStrings()

  const labelToTextMapping = getDateLabelToDisplayText(getString)
  return (
    <Container onClick={onClick} className={Classes.POPOVER_DISMISS}>
      <Layout.Horizontal
        style={{
          justifyContent: 'space-between'
        }}
        spacing="large"
      >
        <Text className={css.pointerText} color="grey600">
          {labelToTextMapping[text]}
        </Text>
        <Text className={css.pointerText} color="grey300">{`${dateRange[0].format(dateFormat[0])} ${
          dateFormat[1] ? '- ' + dateRange[1].format(dateFormat[1]) : ''
        }`}</Text>
      </Layout.Horizontal>
    </Container>
  )
}

interface PerspectiveTimeRangePickerProps {
  setTimeRange: React.Dispatch<
    React.SetStateAction<{
      to: number
      from: number
    }>
  >
}

const PerspectiveTimeRangePicker: React.FC<PerspectiveTimeRangePickerProps> = ({ setTimeRange }) => {
  const { getString } = useStrings()

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean | undefined>()

  const labelToTextMapping = getDateLabelToDisplayText(getString)

  const [selectedTimeRange, setSelectedTimeRange] = useState<{ key: DATE_RANGE_SHORTCUTS_NAME; text: string }>({
    key: DATE_RANGE_SHORTCUTS_NAME.LAST_7_DAYS,
    text: labelToTextMapping[DATE_RANGE_SHORTCUTS_NAME.LAST_7_DAYS]
  })

  const maxDate = new Date(moment().add(30, 'day').valueOf())

  return (
    <Popover
      position={Position.BOTTOM_LEFT}
      modifiers={{
        arrow: { enabled: false },
        flip: { enabled: true },
        keepTogether: { enabled: true },
        preventOverflow: { enabled: true }
      }}
      onClose={() => {
        setIsPopoverOpen(undefined)
      }}
      isOpen={isPopoverOpen}
      content={
        <Layout.Vertical padding="large" spacing="large">
          <Layout.Vertical
            spacing="medium"
            margin={{
              bottom: 'small'
            }}
          >
            <Text font={{ weight: 'semi-bold' }} color="grey800">
              {getString('ce.perspectives.timeRange.recommended')}
            </Text>
            {RECOMMENDED_DATES.map(item => {
              return (
                <DateLabelRenderer
                  key={`recommended-${item.label}`}
                  dateFormat={item.dateFormat}
                  dateRange={item.dateRange}
                  text={item.label}
                  onClick={() => {
                    setTimeRange({
                      from: item.dateRange[0].valueOf(),
                      to: item.dateRange[1].valueOf()
                    })
                    setSelectedTimeRange({
                      key: item.label,
                      text: labelToTextMapping[item.label]
                    })
                  }}
                />
              )
            })}

            <Popover
              position={Position.LEFT_TOP}
              modifiers={{
                flip: { enabled: true },
                keepTogether: { enabled: true },
                preventOverflow: { enabled: true }
              }}
              isOpen={isPopoverOpen}
              content={
                <DateRangePicker
                  contiguousCalendarMonths={false}
                  shortcuts={false}
                  maxDate={maxDate}
                  onChange={val => {
                    if (val[0] && val[1]) {
                      setTimeRange({
                        from: val[0].valueOf(),
                        to: val[1].valueOf()
                      })
                      setSelectedTimeRange({
                        key: DATE_RANGE_SHORTCUTS_NAME.CUSTOM,
                        text: `${moment.utc(val[0]).format(CE_DATE_FORMAT_INTERNAL)} - ${moment
                          .utc(val[1])
                          .format(CE_DATE_FORMAT_INTERNAL)} `
                      })
                      setIsPopoverOpen(false)
                    }
                  }}
                />
              }
            >
              <Text color="primary7" className={css.pointerText}>
                {getString('ce.perspectives.timeRange.selectCustomRange')}
              </Text>
            </Popover>
          </Layout.Vertical>

          <Layout.Vertical
            spacing="medium"
            margin={{
              bottom: 'small'
            }}
          >
            <Text font={{ weight: 'semi-bold' }} color="grey800">
              {getString('ce.perspectives.timeRange.relativeDates')}
            </Text>
            {RELATIVE_DATES.map(item => {
              return (
                <DateLabelRenderer
                  key={`recommended-${item.label}`}
                  dateFormat={item.dateFormat}
                  dateRange={item.dateRange}
                  text={item.label}
                  onClick={() => {
                    setTimeRange({
                      from: item.dateRange[0].valueOf(),
                      to: item.dateRange[1].valueOf()
                    })
                    setSelectedTimeRange({
                      key: item.label,
                      text: labelToTextMapping[item.label]
                    })
                  }}
                />
              )
            })}
          </Layout.Vertical>

          <Layout.Vertical spacing="medium">
            <Text font={{ weight: 'semi-bold' }} color="grey800">
              {getString('ce.perspectives.timeRange.calendarMonths')}
            </Text>
            {CALENDAR_MONTH_DATES.map(item => {
              return (
                <DateLabelRenderer
                  key={`recommended-${item.label}`}
                  dateFormat={item.dateFormat}
                  dateRange={item.dateRange}
                  text={item.label}
                  onClick={() => {
                    setTimeRange({
                      from: item.dateRange[0].valueOf(),
                      to: item.dateRange[1].valueOf()
                    })
                    setSelectedTimeRange({
                      key: item.label,
                      text: labelToTextMapping[item.label]
                    })
                  }}
                />
              )
            })}
          </Layout.Vertical>
        </Layout.Vertical>
      }
    >
      <Button
        intent="primary"
        minimal
        padding="small"
        className={css.timeRangeButton}
        text={selectedTimeRange.text}
        icon="calendar"
        iconProps={{
          size: 16
        }}
        rightIcon="caret-down"
      />
    </Popover>
  )
}

export default PerspectiveTimeRangePicker
