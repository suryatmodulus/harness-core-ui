import { createContext, Dispatch, SetStateAction, useContext } from 'react'
import { noop } from 'lodash-es'
import { Colors } from '@blueprintjs/core'
import type { Module } from '@common/interfaces/RouteInterfaces'

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

// remove these mocks once api is available
export const MOCK_DATA = {
  ServiceInstancesWidget: {
    serviceCount: 57,
    serviceInstancesCount: 130,
    trendTitle: '6 month trend',
    trendData: [20, 50, 30, 50, 60, 70, 80, 35, 56, 78, 45],
    trendPopoverData: [
      {
        name: 'Failed',
        data: [30, 10, 20, 10, 20, 30, 20, 15, 16, 28, 35],
        color: Colors.RED5
      },
      {
        name: 'Successful',
        data: [20, 30, 60, 70, 20, 10, 60, 85, 58, 72, 65],
        color: Colors.GREEN5
      }
    ],
    nonProdCount: 120,
    prodCount: 20
  }
}
