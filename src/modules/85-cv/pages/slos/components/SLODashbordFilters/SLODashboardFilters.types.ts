import type { ResponseListMonitoredServiceWithHealthSources, ResponsePageUserJourneyResponse } from 'services/cv'
import type { SLOFilterAction, SLOFilterState } from '../../CVSLOsListingPage.types'

export interface SLOFilterItemsData {
  userJourney: ResponsePageUserJourneyResponse | null
  monitoredServices: ResponseListMonitoredServiceWithHealthSources | null
}

export interface SLODashbordFiltersProps {
  filterState: SLOFilterState
  dispatch: React.Dispatch<SLOFilterAction>
  filterItemsData: SLOFilterItemsData
  hideMonitoresServicesFilter: boolean
}
