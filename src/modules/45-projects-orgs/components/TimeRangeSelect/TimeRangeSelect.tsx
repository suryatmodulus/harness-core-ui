import React from 'react'
import { SelectOption, Select } from '@wings-software/uicore'
import { DashboardTimeRange, useLandingDashboardContext } from '@common/factories/LandingDashboardContext'
import { useStrings } from 'framework/strings'

interface TimeRangeSelectProps {
  className?: string
}

const TimeRangeSelect: React.FC<TimeRangeSelectProps> = props => {
  const { selectTimeRange } = useLandingDashboardContext()
  const { getString } = useStrings()

  const options: SelectOption[] = [
    { label: getString('projectsOrgs.landingDashboard.last30Days'), value: DashboardTimeRange['30Days'] },
    { label: getString('projectsOrgs.landingDashboard.last60Days'), value: DashboardTimeRange['60Days'] },
    { label: getString('projectsOrgs.landingDashboard.last90Days'), value: DashboardTimeRange['90Days'] },
    { label: getString('projectsOrgs.landingDashboard.last1Year'), value: DashboardTimeRange['1Year'] }
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
