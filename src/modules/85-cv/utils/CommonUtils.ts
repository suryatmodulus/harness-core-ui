/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { get } from 'lodash-es'
import { Color, Utils, Views, SelectOption, MultiSelectOption } from '@wings-software/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { ResponseListEnvironmentResponse, EnvironmentResponse } from 'services/cd-ng'
import type { StringsMap } from 'stringTypes'
import type { MonitoredServiceEnum } from '@cv/pages/monitored-service/MonitoredServicePage.constants'
import type { SloHealthIndicatorDTO } from 'services/cv'

export enum RiskValues {
  NO_DATA = 'NO_DATA',
  NO_ANALYSIS = 'NO_ANALYSIS',
  HEALTHY = 'HEALTHY',
  OBSERVE = 'OBSERVE',
  NEED_ATTENTION = 'NEED_ATTENTION',
  UNHEALTHY = 'UNHEALTHY'
}

export enum SLOErrorBudget {
  EXHAUSTED = 'EXHAUSTED'
}

// Need to remove once removed from BE.
type OldRiskTypes = 'LOW' | 'MEDIUM' | 'HIGH'
type RiskTypes = keyof typeof RiskValues | OldRiskTypes

export const getRiskColorValue = (
  riskStatus?: RiskTypes | SloHealthIndicatorDTO['errorBudgetRisk'],
  realCSSColor = true,
  dark = true
): string => {
  const COLOR_NO_DATA = dark ? Color.GREY_400 : Color.GREY_100

  switch (riskStatus) {
    case RiskValues.HEALTHY:
      return realCSSColor ? Utils.getRealCSSColor(Color.GREEN_500) : Color.GREEN_500
    case RiskValues.OBSERVE:
      return realCSSColor ? Utils.getRealCSSColor(Color.YELLOW_800) : Color.YELLOW_800
    case RiskValues.NEED_ATTENTION:
      return realCSSColor ? Utils.getRealCSSColor(Color.ORANGE_600) : Color.ORANGE_600
    case RiskValues.UNHEALTHY:
      return realCSSColor ? Utils.getRealCSSColor(Color.RED_600) : Color.RED_600
    case SLOErrorBudget.EXHAUSTED:
      return realCSSColor ? Utils.getRealCSSColor(Color.RED_800) : Color.RED_800
    default:
      return realCSSColor ? Utils.getRealCSSColor(COLOR_NO_DATA) : COLOR_NO_DATA
  }
}

export function getSecondaryRiskColorValue(
  riskStatus?: RiskTypes | SloHealthIndicatorDTO['errorBudgetRisk'],
  realCSSColor = true
): string {
  switch (riskStatus) {
    case RiskValues.HEALTHY:
      return realCSSColor ? Utils.getRealCSSColor(Color.GREEN_50) : Color.GREEN_50
    case RiskValues.OBSERVE:
      return realCSSColor ? Utils.getRealCSSColor(Color.YELLOW_50) : Color.YELLOW_50
    case RiskValues.NEED_ATTENTION:
      return realCSSColor ? Utils.getRealCSSColor(Color.ORANGE_50) : Color.ORANGE_50
    case RiskValues.UNHEALTHY:
      return realCSSColor ? Utils.getRealCSSColor(Color.RED_50) : Color.RED_50
    case SLOErrorBudget.EXHAUSTED:
      return realCSSColor ? Utils.getRealCSSColor(Color.RED_100) : Color.RED_100
    default:
      return realCSSColor ? Utils.getRealCSSColor(Color.GREY_50) : Color.GREY_50
  }
}

export const getRiskLabelStringId = (
  riskStatus?: RiskTypes | SloHealthIndicatorDTO['errorBudgetRisk']
): keyof StringsMap => {
  switch (riskStatus) {
    case RiskValues.NO_DATA:
      return 'noData'
    case RiskValues.NO_ANALYSIS:
      return 'cv.noAnalysis'
    case RiskValues.HEALTHY:
      return 'cv.monitoredServices.serviceHealth.serviceDependencies.states.healthy'
    case RiskValues.OBSERVE:
      return 'cv.monitoredServices.serviceHealth.serviceDependencies.states.observe'
    case RiskValues.NEED_ATTENTION:
      return 'cv.monitoredServices.serviceHealth.serviceDependencies.states.needsAttention'
    case RiskValues.UNHEALTHY:
      return 'cv.monitoredServices.serviceHealth.serviceDependencies.states.unhealthy'
    case SLOErrorBudget.EXHAUSTED:
      return 'cv.monitoredServices.serviceHealth.serviceDependencies.states.exhausted'
    default:
      return 'na'
  }
}

export function roundNumber(value: number, precision = 2) {
  if (Number.isInteger(precision) && precision >= 0) {
    const factor = 10 ** precision
    return Math.round(value * factor) / factor
  }
}

export function getErrorMessage(errorObj?: any): string | undefined {
  return get(errorObj, 'data.detailedMessage') || get(errorObj, 'data.message') || get(errorObj, 'message')
}

export const getEnvironmentOptions = (
  environmentList: ResponseListEnvironmentResponse | null,
  loading: boolean,
  getString: UseStringsReturn['getString']
): SelectOption[] => {
  if (loading) {
    return [{ label: getString('loading'), value: 'loading' }]
  }
  if (environmentList?.data?.length) {
    const allOption: SelectOption = { label: getString('all'), value: getString('all') }
    const environmentSelectOption: SelectOption[] =
      environmentList?.data?.map((environmentData: EnvironmentResponse) => {
        const { name = '', identifier = '' } = environmentData?.environment || {}
        return {
          label: name,
          value: identifier
        }
      }) || []
    return [allOption, ...environmentSelectOption]
  }
  return []
}

interface GetCVMonitoringServicesSearchParamProps {
  view?: Views
  tab?: MonitoredServiceEnum
}

export const getCVMonitoringServicesSearchParam = ({ view, tab }: GetCVMonitoringServicesSearchParamProps): string => {
  let searchParam = `?`

  if (view === Views.GRID) {
    searchParam = searchParam.concat(`view=${view}&`)
  }
  if (tab) {
    searchParam = searchParam.concat(`tab=${tab}`)
  }

  return searchParam
}

export const prepareFilterInfo = (data?: MultiSelectOption[]): Array<string | number> => {
  return data ? data.map((d: MultiSelectOption) => d.value as string) : []
}

export const isNumeric = (val: string): boolean => {
  return /^-?\d+$/.test(val)
}
