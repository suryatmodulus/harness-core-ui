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
