import React from 'react'

const GatewayContext = React.createContext({ isEditFlow: false })

export const useGatewayContext = (): { isEditFlow: boolean } => React.useContext(GatewayContext)

export function GatewayContextProvider(props: React.PropsWithChildren<{ isEditFlow: boolean }>) {
  return <GatewayContext.Provider value={{ isEditFlow: props.isEditFlow }}>{props.children}</GatewayContext.Provider>
}
