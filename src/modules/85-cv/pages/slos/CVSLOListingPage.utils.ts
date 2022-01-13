import type { Dispatch, SetStateAction } from 'react'
import type QueryString from 'qs'
import moment from 'moment'
import type Highcharts from 'highcharts'
import { Utils, Color, SelectOption } from '@wings-software/uicore'
import type { GetDataError } from 'restful-react'
import type { UseStringsReturn } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import type {
  UserJourneyResponse,
  UserJourneyDTO,
  SLODashboardWidget,
  ResponseListMonitoredServiceWithHealthSources,
  GetSLODashboardWidgetsQueryParams,
  RiskCount,
  MonitoredServiceDTO,
  GetAllJourneysQueryParams
} from 'services/cv'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import {
  PAGE_SIZE_DASHBOARD_WIDGETS,
  LIST_USER_JOURNEYS_OFFSET,
  LIST_USER_JOURNEYS_PAGESIZE,
  SLOActionTypes
} from './CVSLOsListingPage.constants'
import {
  SLOCardToggleViews,
  GetSLOAndErrorBudgetGraphOptions,
  SLORiskFilter,
  RiskTypes,
  SLITypesParams,
  TargetTypesParams,
  SLOActionPayload,
  SLOFilterAction,
  SLOFilterState
} from './CVSLOsListingPage.types'

import { getUserJourneyOptions } from './components/CVCreateSLO/CVCreateSLO.utils'
import { getMonitoredServicesOptions } from './components/CVCreateSLO/components/CreateSLOForm/components/SLI/SLI.utils'

export const getUserJourneys = (userJourneyResponse?: UserJourneyResponse[]): UserJourneyDTO[] => {
  return userJourneyResponse?.map(response => response.userJourney) ?? []
}

export const getSLORiskTypeFilter = (
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  riskTypes?: RiskCount[],
  totalCount?: number
): SLORiskFilter[] => {
  if (!riskTypes) {
    return []
  }

  const totalCountDetail = {
    displayName: getString('cv.slos.totalServices'),
    identifier: getString('all'),
    displayColor: Color.BLACK,
    count: totalCount
  }

  const riskTypesCardData = riskTypes.map(riskType => ({
    ...riskType,
    displayColor: getRiskColorValue(riskType.identifier as RiskTypes, false)
  }))

  return [totalCountDetail as SLORiskFilter, ...riskTypesCardData]
}

export const getErrorBudgetGaugeOptions = (serviceLevelObjective: SLODashboardWidget): Highcharts.Options => ({
  yAxis: {
    max: serviceLevelObjective.totalErrorBudget,
    tickPositions: [0, serviceLevelObjective.totalErrorBudget],
    minorTickLength: 0,
    tickLength: 0
  },
  series: [
    {
      type: 'solidgauge',
      data: [
        {
          y: serviceLevelObjective.errorBudgetRemaining,
          color: getRiskColorValue(serviceLevelObjective.errorBudgetRisk)
        }
      ],
      dataLabels: {
        formatter: function () {
          return `
            <div style="text-align:center">
              <span style="font-size:25px">
                ${Number(serviceLevelObjective.errorBudgetRemainingPercentage || 0).toFixed(2)}%
              </span>
            </div>
          `
        }
      }
    }
  ]
})

const getDateUnitAndInterval = (serviceLevelObjective: SLODashboardWidget): { unit: string; interval: number } => {
  const MILLISECONDS_PER_SIX_HOURS = 1000 * 60 * 60 * 6
  const timeline = serviceLevelObjective.currentPeriodLengthDays - serviceLevelObjective.timeRemainingDays

  if (timeline <= 1) {
    return { unit: 'MMM D hh:m A', interval: (MILLISECONDS_PER_SIX_HOURS * 4) / 3 }
  }

  if (timeline <= 3) {
    return { unit: 'MMM D hh:m A', interval: MILLISECONDS_PER_SIX_HOURS * timeline * 2 }
  }

  return { unit: 'MMM D', interval: MILLISECONDS_PER_SIX_HOURS * timeline }
}

export const getSLOAndErrorBudgetGraphOptions = ({
  type,
  minXLimit,
  maxXLimit,
  serviceLevelObjective
}: GetSLOAndErrorBudgetGraphOptions): Highcharts.Options => {
  const labelColor = Utils.getRealCSSColor(Color.PRIMARY_7)
  const { unit, interval } = getDateUnitAndInterval(serviceLevelObjective)

  const plotLines: Highcharts.YAxisPlotLinesOptions[] = [
    {
      value: Number((Number(serviceLevelObjective.sloTargetPercentage) || 0).toFixed(2)),
      color: Utils.getRealCSSColor(Color.PRIMARY_7),
      width: 2,
      zIndex: 4,
      label: {
        useHTML: true,
        formatter: function () {
          return `
            <div style="background-color:${labelColor};padding:4px 6px;border-radius:4px" >
              <span style="color:white">
                ${Number((Number(serviceLevelObjective.sloTargetPercentage) || 0).toFixed(2))}%
              </span>
            </div>
          `
        }
      }
    }
  ]

  return {
    chart: { height: 200, spacing: [30, 0, 20, 0] },
    xAxis: {
      min: serviceLevelObjective.currentPeriodStartTime,
      tickInterval: interval,
      labels: {
        formatter: function () {
          return moment(this.value).format(unit)
        }
      }
    },
    yAxis: {
      min: minXLimit,
      max: maxXLimit,
      plotLines: type === SLOCardToggleViews.SLO ? plotLines : undefined
    },
    plotOptions:
      type === SLOCardToggleViews.ERROR_BUDGET ? { area: { color: Utils.getRealCSSColor(Color.RED_400) } } : undefined
  }
}

const getAllOption = (getString: UseStringsReturn['getString']): SelectOption => {
  return { label: getString('all'), value: getString('all') }
}

export const getUserJourneyOptionsForFilter = (
  userJourneyData: UserJourneyResponse[] | undefined,
  getString: UseStringsReturn['getString']
): SelectOption[] => {
  return [getAllOption(getString), ...getUserJourneyOptions(userJourneyData)]
}

export const getMonitoredServicesOptionsForFilter = (
  monitoredServiceData: ResponseListMonitoredServiceWithHealthSources | null,
  getString: UseStringsReturn['getString']
): SelectOption[] => {
  return [getAllOption(getString), ...getMonitoredServicesOptions(monitoredServiceData)]
}

export const getSliTypeOptionsForFilter = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    getAllOption(getString),
    {
      label: 'Availability',
      value: 'Availability'
    },
    {
      label: 'Latency',
      value: 'Latency'
    }
  ]
}

export const getPeriodTypeOptionsForFilter = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    getAllOption(getString),
    {
      label: 'Rolling',
      value: 'Rolling'
    },
    {
      label: 'Calender',
      value: 'Calender'
    }
  ]
}

export function getFilterValueForSLODashboardParams(
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  selectedValue: SelectOption
): string[] | undefined {
  if (selectedValue.value !== getString('all')) {
    return [selectedValue.value as string]
  }
}

export function getRiskFilterForSLODashboardParams(
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  selectedValue: string | null
): string[] | undefined {
  if (selectedValue && selectedValue !== getString('all')) {
    return [selectedValue as string]
  }
}

export function getMonitoredServiceSLODashboardParams(
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  monitoredService: SelectOption
): string | undefined {
  return monitoredService.value !== getString('all') ? (monitoredService.value as string) : undefined
}

export function getIsSLODashboardAPIsLoading(
  userJourneysLoading: boolean,
  dashboardWidgetsLoading: boolean,
  deleteSLOLoading: boolean,
  monitoredServicesLoading: boolean,
  riskCountLoading: boolean
): boolean {
  return (
    userJourneysLoading || dashboardWidgetsLoading || deleteSLOLoading || monitoredServicesLoading || riskCountLoading
  )
}

type ErrorType = GetDataError<unknown> | null
// Sonar recommendation
export const getErrorObject = (
  dashboardWidgetsError: ErrorType,
  userJourneysError: ErrorType,
  dashboardRiskCountError: ErrorType,
  monitoredServicesDataError: ErrorType
): ErrorType => {
  return dashboardWidgetsError || userJourneysError || dashboardRiskCountError || monitoredServicesDataError
}

export const getIsDataEmpty = (contentLength?: number, riskCountLength?: number): boolean => {
  return !contentLength && !riskCountLength
}

export const getIsWidgetDataEmpty = (contentLength?: number, dashboardWidgetsLoading?: boolean): boolean => {
  return !contentLength && !dashboardWidgetsLoading
}

export const getIsSetPreviousPage = (pageIndex: number, pageItemCount: number): boolean => {
  return Boolean(pageIndex) && pageItemCount === 1
}

export function setFilterValue<T>(callback: Dispatch<SetStateAction<T>>, value: T): void {
  if (value) {
    callback(value)
  }
}

const defaultAllOption: SelectOption = { label: 'All', value: 'All' }

const getDefaultAllOption = (
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): SelectOption => ({ label: getString('all'), value: getString('all') })

export const initialState: SLOFilterState = {
  userJourney: defaultAllOption,
  monitoredService: defaultAllOption,
  sliTypes: defaultAllOption,
  targetTypes: defaultAllOption,
  sloRiskFilter: null
}

const updateUserJourney = (payload: SLOActionPayload): SLOFilterAction => ({
  type: SLOActionTypes.userJourney,
  payload
})
const updateMonitoredServices = (payload: SLOActionPayload): SLOFilterAction => ({
  type: SLOActionTypes.monitoredService,
  payload
})
const updateSliType = (payload: SLOActionPayload): SLOFilterAction => ({
  type: SLOActionTypes.sliTypes,
  payload
})
const updateTargetType = (payload: SLOActionPayload): SLOFilterAction => ({
  type: SLOActionTypes.targetTypes,
  payload
})
const updateSloRiskType = (payload: SLOActionPayload): SLOFilterAction => ({
  type: SLOActionTypes.sloRiskFilterAction,
  payload
})

const resetFilters = (): SLOFilterAction => ({
  type: SLOActionTypes.reset
})
const resetFiltersInMonitoredServicePageAction = (): SLOFilterAction => ({
  type: SLOActionTypes.resetFiltersInMonitoredServicePage
})

export const SLODashboardFilterActions = {
  updateUserJourney,
  updateMonitoredServices,
  updateSliType,
  updateTargetType,
  updateSloRiskType,
  resetFilters,
  resetFiltersInMonitoredServicePageAction
}

export const sloFilterReducer = (state = initialState, data: SLOFilterAction): SLOFilterState => {
  switch (data.type) {
    case SLOActionTypes.userJourney:
      return {
        ...state,
        userJourney: data.payload?.userJourney as SelectOption
      }
    case SLOActionTypes.monitoredService:
      return {
        ...state,
        monitoredService: data.payload?.monitoredService as SelectOption
      }
    case SLOActionTypes.sliTypes:
      return {
        ...state,
        sliTypes: data.payload?.sliTypes as SelectOption
      }
    case SLOActionTypes.targetTypes:
      return {
        ...state,
        targetTypes: data.payload?.targetTypes as SelectOption
      }
    case SLOActionTypes.sloRiskFilterAction:
      return {
        ...state,
        sloRiskFilter: data.payload?.sloRiskFilter as SLORiskFilter | null
      }
    case SLOActionTypes.reset:
      return initialState
    case SLOActionTypes.resetFiltersInMonitoredServicePage:
      return {
        ...initialState,
        monitoredService: state.monitoredService
      }
    default:
      return initialState
  }
}

export const getInitialFilterState = (
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): SLOFilterState => {
  return {
    userJourney: getDefaultAllOption(getString),
    monitoredService: getDefaultAllOption(getString),
    sliTypes: getDefaultAllOption(getString),
    targetTypes: getDefaultAllOption(getString),
    sloRiskFilter: null
  }
}

export const getInitialFilterStateLazy = (
  defaultInitialState: SLOFilterState,
  monitoredServiceData?: Pick<MonitoredServiceDTO, 'name' | 'identifier'>
): SLOFilterState => {
  if (!monitoredServiceData) {
    return defaultInitialState
  }

  return {
    ...defaultInitialState,
    monitoredService: {
      label: monitoredServiceData.name,
      value: monitoredServiceData.identifier
    }
  }
}

const getIsFiltersUnchanged = (
  filters: (string | number | symbol)[],
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): boolean => filters.every(value => value === getString('all'))

export const getIsClearFilterDisabled = (
  filterState: SLOFilterState,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): boolean => {
  const { monitoredService, sliTypes, sloRiskFilter, targetTypes, userJourney } = filterState

  return (
    getIsFiltersUnchanged([monitoredService.value, sliTypes.value, targetTypes.value, userJourney.value], getString) &&
    sloRiskFilter === null
  )
}

export const getIsMonitoresServicePageClearFilterDisabled = (
  filterState: SLOFilterState,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): boolean => {
  const { sliTypes, sloRiskFilter, targetTypes, userJourney } = filterState

  return (
    getIsFiltersUnchanged([sliTypes.value, targetTypes.value, userJourney.value], getString) && sloRiskFilter === null
  )
}

interface SLODashboardWidgetsParams {
  queryParams: GetSLODashboardWidgetsQueryParams
  queryParamStringifyOptions: QueryString.IStringifyOptions
}

interface PathParams {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

export const getSLODashboardWidgetsParams = (
  pathParams: PathParams,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  filterState: SLOFilterState,
  pageNumber?: number
): SLODashboardWidgetsParams => {
  return {
    queryParams: {
      ...pathParams,
      monitoredServiceIdentifier: getMonitoredServiceSLODashboardParams(getString, filterState.monitoredService),
      pageNumber,
      pageSize: PAGE_SIZE_DASHBOARD_WIDGETS,
      userJourneyIdentifiers: getFilterValueForSLODashboardParams(getString, filterState.userJourney),
      targetTypes: getFilterValueForSLODashboardParams(getString, filterState.targetTypes) as TargetTypesParams[],
      sliTypes: getFilterValueForSLODashboardParams(getString, filterState.sliTypes) as SLITypesParams[],
      errorBudgetRisks: getRiskFilterForSLODashboardParams(
        getString,
        filterState.sloRiskFilter?.identifier as string | null
      ) as RiskTypes[]
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  }
}

export const getServiceLevelObjectivesRiskCountParams = (
  pathParams: PathParams,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  filterState: SLOFilterState
): SLODashboardWidgetsParams => {
  return {
    queryParams: {
      ...pathParams,
      monitoredServiceIdentifier: getMonitoredServiceSLODashboardParams(getString, filterState.monitoredService),
      userJourneyIdentifiers: getFilterValueForSLODashboardParams(getString, filterState.userJourney),
      targetTypes: getFilterValueForSLODashboardParams(getString, filterState.targetTypes) as TargetTypesParams[],
      sliTypes: getFilterValueForSLODashboardParams(getString, filterState.sliTypes) as SLITypesParams[]
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  }
}

export const getUserJourneyParams = (pathParams: PathParams): { queryParams: GetAllJourneysQueryParams } => {
  return {
    queryParams: {
      ...pathParams,
      offset: LIST_USER_JOURNEYS_OFFSET,
      pageSize: LIST_USER_JOURNEYS_PAGESIZE
    }
  }
}

export const getMonitoredServicesInitialState = (monitoredService: {
  name: string
  identifier: string
}): { monitoredService: SelectOption } => {
  return {
    monitoredService: {
      label: monitoredService.name,
      value: monitoredService.identifier
    }
  }
}
