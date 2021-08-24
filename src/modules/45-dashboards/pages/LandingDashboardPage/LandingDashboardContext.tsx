import React, { createContext, useContext, useState } from 'react'

export enum DashboardTimeRange {
  '30Days' = '30Days',
  '60Days' = '60Days',
  '90Days' = '90Days',
  '1Year' = '1Year'
}

interface LandingDashboardContextProps {
  selectedTimeRange: DashboardTimeRange
  selectTimeRange: (timeRange: DashboardTimeRange) => void
}

const LandingDashboardContext = createContext<LandingDashboardContextProps>({
  selectedTimeRange: DashboardTimeRange['30Days'],
  selectTimeRange: () => void 0
})

export function LandingDashboardContextProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const [selectedTimeRange, setSelectedTimeRange] = useState(DashboardTimeRange['30Days'])

  const selectTimeRange = (timeRange: DashboardTimeRange): void => {
    setSelectedTimeRange(timeRange)
  }

  return (
    <LandingDashboardContext.Provider
      value={{
        selectedTimeRange,
        selectTimeRange
      }}
    >
      {props.children}
    </LandingDashboardContext.Provider>
  )
}

export function useLandingDashboardContext(): LandingDashboardContextProps {
  return useContext(LandingDashboardContext)
}

export default LandingDashboardContext
