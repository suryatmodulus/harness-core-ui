import { createContext, Dispatch, SetStateAction, useContext } from 'react'
import { noop } from 'lodash-es'

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
