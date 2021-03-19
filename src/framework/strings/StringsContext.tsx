import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StringsMap = Record<string, any>

export const StringsContext = React.createContext<StringsMap>({})

export function useStringsContext(): StringsMap {
  return React.useContext(StringsContext)
}
