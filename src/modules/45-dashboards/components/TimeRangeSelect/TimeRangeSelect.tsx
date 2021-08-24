import React from 'react'
import { SelectOption, Select } from '@wings-software/uicore'
import {
  DashboardTimeRange,
  useLandingDashboardContext
} from '@dashboards/pages/LandingDashboardPage/LandingDashboardContext'

interface TimeRangeSelectProps {
  className?: string
}

const TimeRangeSelect: React.FC<TimeRangeSelectProps> = props => {
  const { selectTimeRange } = useLandingDashboardContext()

  const options: SelectOption[] = [
    { label: 'Last 30 Days', value: DashboardTimeRange['30Days'] },
    { label: 'Last 60 Days', value: DashboardTimeRange['60Days'] },
    { label: 'Last 90 Days', value: DashboardTimeRange['90Days'] },
    { label: 'Last Year', value: DashboardTimeRange['1Year'] }
  ]
  return (
    <Select
      items={options}
      onChange={option => {
        selectTimeRange(option.value as DashboardTimeRange)
      }}
      className={props.className}
      defaultSelectedItem={options[0]}
    />
  )
}

export default TimeRangeSelect
