/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// This utility toolkip provides functions to generate RSQL strings
// RSQL grammar and semantics can be found here: https://github.com/jirutka/rsql-parser#grammar-and-semantic
// eg. usage: and(equals('name', 'john'), includes('age', [20, 30, 40]))) => equivalent to "name is john and age is in (20, 30, 40)"
// you can also use the shorthand notation like and(eq('name', 'john'), gt('year', 2020))

const reservedCharacters = /"|'|\(|\)|;|,|=|!|~|<|>/

type Value = string | number
type Operator = '==' | '!=' | '=lt=' | '=gt=' | '=le=' | '=ge=' | '=in=' | '=out='

function valid(val: string): boolean {
  return !reservedCharacters.test(val)
}

function getExpression(operator: Operator, field: string, value: Value | Value[]): string {
  if (
    !valid(field) || // test field
    (typeof value === 'string' && !valid(value)) || // test value if value is string
    (value instanceof Array && value.filter(val => typeof val === 'string' && !valid(val)).length > 0) // test all string values if value is an array
  ) {
    throw new Error('String contains reserved characters')
  }

  return `${field}${operator}${value instanceof Array ? `(${value.join(',')})` : value}`
}

export function equals(field: string, value: Value): string {
  return getExpression('==', field, value)
}

export const eq = equals

export function notEquals(field: string, value: Value): string {
  return getExpression('!=', field, value)
}

export const ne = notEquals

export function lessThan(field: string, value: Value): string {
  return getExpression('=lt=', field, value)
}

export const lt = lessThan

export function greaterThan(field: string, value: Value): string {
  return getExpression('=gt=', field, value)
}

export const gt = greaterThan

export function lessThanOrEquals(field: string, value: Value): string {
  return getExpression('=le=', field, value)
}

export const le = lessThanOrEquals

export function greaterThanOrEquals(field: string, value: Value): string {
  return getExpression('=ge=', field, value)
}

export const ge = greaterThanOrEquals

export function includes(field: string, value: Array<Value>): string {
  return getExpression('=in=', field, value)
}

export function excludes(field: string, value: Array<Value>): string {
  return getExpression('=out=', field, value)
}

export function and(...args: Array<string | undefined>): string {
  args = args.filter(arg => arg !== undefined)
  return args.length ? `(${args.join(';')})` : ''
}

export function or(...args: Array<string | undefined>): string {
  args = args.filter(arg => arg !== undefined)
  return args.length ? `(${args.join(',')})` : ''
}
