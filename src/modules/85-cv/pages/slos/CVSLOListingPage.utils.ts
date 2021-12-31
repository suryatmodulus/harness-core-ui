import moment from 'moment'
import type Highcharts from 'highcharts'
import { Utils, Color, SelectOption } from '@wings-software/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import type {
  UserJourneyResponse,
  UserJourneyDTO,
  SLODashboardWidget,
  ResponseListMonitoredServiceWithHealthSources,
  RiskCount
} from 'services/cv'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import {
  SLOCardToggleViews,
  GetSLOAndErrorBudgetGraphOptions,
  SLORiskFilter,
  RiskTypes
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
  selectedValue?: string
): string[] | undefined {
  if (selectedValue && selectedValue !== getString('all')) {
    return [selectedValue]
  }
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

export function getMonitoredServicesInitialValue(
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  monitoredServiceIdentifier?: string
): string {
  return monitoredServiceIdentifier ?? getString('all')
}
