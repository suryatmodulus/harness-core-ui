import React from 'react'

import type { StringsMap } from 'stringTypes'

export type StringKeys = keyof StringsMap

export type { StringsMap }

export const StringsContext = React.createContext<StringsMap>({} as StringsMap)

export function useStringsContext(): StringsMap {
  return React.useContext(StringsContext)
}
