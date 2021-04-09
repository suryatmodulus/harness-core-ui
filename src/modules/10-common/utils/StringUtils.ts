import { ModuleName } from 'framework/exports'
import routes from '@common/RouteDefinitions'

export function getIdentifierFromName(str: string): string {
  return str
    .trim()
    .replace(/[^0-9a-zA-Z_$ ]/g, '') // remove special chars except _ and $
    .replace(/ +/g, '_') // replace spaces with _
}

export const illegalIdentifiers = [
  'or',
  'and',
  'eq',
  'ne',
  'lt',
  'gt',
  'le',
  'ge',
  'div',
  'mod',
  'not',
  'null',
  'true',
  'false',
  'new',
  'var',
  'return'
]

export const DEFAULT_DATE_FORMAT = 'MM/DD/YYYY hh:mm a'

export function pluralize(number: number): string {
  return number > 1 || number === 0 ? 's' : ''
}

export const regexEmail = /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const regexName = /^[A-Za-z0-9_-][A-Za-z0-9 _-]*$/

export const regexIdentifier = /^[a-zA-Z_.][0-9a-zA-Z_$]*$/

export const UNIQUE_ID_MAX_LENGTH = 64
export function toVariableStr(str: string): string {
  return `<+${str}>`
}

export const getModuleNameByString = (module: string | undefined): ModuleName | undefined => {
  const name = module && module.toUpperCase()
  switch (name) {
    case 'CD':
      return ModuleName.CD
    case 'CE':
      return ModuleName.CE
    case 'CF':
      return ModuleName.CF
    case 'CI':
      return ModuleName.CI
    case 'CV':
      return ModuleName.CV
  }
  return undefined
}

export const getHomeLinkByAcctIdAndModuleName = (accountId: Required<string>, module?: ModuleName): string => {
  switch (module) {
    case ModuleName.CD:
      return routes.toCDHome({
        accountId
      })
    case ModuleName.CV:
      return routes.toCVHome({
        accountId
      })
    case ModuleName.CI:
      return routes.toCIHome({
        accountId
      })
    case ModuleName.CE:
      return routes.toCEHome({
        accountId
      })
    case ModuleName.CF:
      return routes.toCFHome({
        accountId
      })
  }

  return routes.toProjects({
    accountId
  })
}

export const getTrialHomeLinkByAcctIdAndModuleName = (
  accountId: Required<string>,
  module: ModuleName | undefined
): string => {
  switch (module) {
    case ModuleName.CD:
      return routes.toCDTrialHome({
        accountId
      })
    case ModuleName.CV:
      return routes.toCVTrialHome({
        accountId
      })
    case ModuleName.CI:
      return routes.toCITrialHome({
        accountId
      })
    case ModuleName.CE:
      return routes.toCETrialHome({
        accountId
      })
    case ModuleName.CF:
      return routes.toCFTrialHome({
        accountId
      })
  }

  return routes.toProjects({
    accountId
  })
}
