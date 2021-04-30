import { createContext, Dispatch, SetStateAction, useContext } from 'react'
import { noop } from 'lodash-es'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { TIME_RANGE_ENUMS } from '@dashboards/components/TimeRangeSelector/TimeRangeSelector'

export enum Views {
  LIST,
  INSIGHT
}

export type ParamsType = {
  orgIdentifier: string
  projectIdentifier: string
  accountId: string
  module: Module
}

export interface ServiceStore {
  view: Views
  setView: Dispatch<SetStateAction<Views>>
}

export const ServiceStoreContext = createContext({
  view: Views.INSIGHT,
  setView: noop
})

export const useServiceStore = (): ServiceStore => useContext(ServiceStoreContext)

export const DeploymentsTimeRangeContext = createContext<{
  timeRange: TIME_RANGE_ENUMS
  setTimeRange: (timeRange: TIME_RANGE_ENUMS) => void
}>({
  timeRange: TIME_RANGE_ENUMS.SIX_MONTHS,
  setTimeRange: noop
})

export const numberFormatter = (value: number): string => {
  const options = [
    { value: 1000000, suffix: 'm' },
    { value: 1000, suffix: 'k' }
  ]
  for (const option of options) {
    if (value >= option.value) {
      const truncatedValue = (value / option.value).toFixed(1)
      return `${truncatedValue}${option.suffix}`
    }
  }
  return `${value}`
}
