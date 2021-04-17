import { flatMap } from 'lodash-es'

const getEntries = function <T>(object: T, prefix = ''): Array<any> {
  return flatMap(Object.entries(object), ([k, v]: { k: string; v: any }[]) =>
    Object(v) === v ? getEntries(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]
  )
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function flatObject(object: object): object {
  return getEntries(object).reduce((o, k) => ((o[k[0]] = k[1]), o), {})
}
