import React from 'react'
import { useFetchCcmMetaDataQuery } from 'services/ce/services'

const CCMContext = React.createContext({})

export const useCCMContext = (): any => React.useContext(CCMContext)

export function CCMContextProvider(props: { children: React.ReactNode }) {
  const [ccmMetaResult, refetchCCMMetaData] = useFetchCcmMetaDataQuery()

  return <CCMContext.Provider value={{ ccmMetaResult, refetchCCMMetaData }}>{props.children}</CCMContext.Provider>
}
