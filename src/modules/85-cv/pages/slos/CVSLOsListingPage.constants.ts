export const PAGE_SIZE_DASHBOARD_WIDGETS = 4

// Note will be removed once the BE removes these query params
export const LIST_USER_JOURNEYS_OFFSET = 0
export const LIST_USER_JOURNEYS_PAGESIZE = 100

export enum SLOActionTypes {
  userJourney = 'userJourney',
  monitoredService = 'monitoredService',
  sliTypes = 'sliTypes',
  targetTypes = 'targetTypes',
  sloRiskFilterAction = 'SLORiskFilter',
  reset = 'reset',
  resetFiltersInMonitoredServicePage = 'resetFiltersInMonitoredServicePage'
}
