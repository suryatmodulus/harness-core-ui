/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  getCPUValueInReadableForm,
  getMemValueInReadableForm,
  getMemValueInReadableFormForChart,
  getCPUValueInmCPUs,
  getMemValueInGB
} from '../formatResourceValue'

import { convertNumberToFixedDecimalPlaces } from '../convertNumberToFixedDecimalPlaces'

import formatCost from '../formatCost'
import { clusterInfoUtil } from '../perspectiveUtils'

describe('test cases for recommendation utils', () => {
  test('test cases for CPU value formatter', () => {
    expect(getCPUValueInReadableForm(0.01)).toBe('10m')
    expect(getCPUValueInReadableForm(10)).toBe('10')
  })

  test('test cases for Memory value formatter', () => {
    expect(getMemValueInReadableForm(1000000000)).toBe('1000Mi')
    expect(getMemValueInReadableForm(100000000)).toBe('100Mi')
    expect(getMemValueInReadableForm(1000000)).toBe('1Mi')
    expect(getMemValueInReadableForm(4200000000)).toBe('4.2Gi')
  })

  test('test cases for converting number to fix decimal places', () => {
    expect(convertNumberToFixedDecimalPlaces('10.32324', 2)).toBe(10.32)
    expect(convertNumberToFixedDecimalPlaces(78.3232324, 2)).toBe(78.32)
  })

  test('test cases for getting mem value in GBs', () => {
    expect(getMemValueInGB(1000000000)).toBe('1Gi')
    expect(getMemValueInGB(100000000)).toBe('0.1Gi')
  })

  test('test cases for getting cpu values in mCPUs', () => {
    expect(getCPUValueInmCPUs(1)).toBe('1000')
    expect(getCPUValueInmCPUs(0.001)).toBe('1')
  })

  test('get mem in readable format for chart', () => {
    expect(getMemValueInReadableFormForChart(100000000)).toBe('100.00Mi')
    expect(getMemValueInReadableFormForChart(1000000)).toBe('1.00Mi')
  })
})

describe('test cases for formatcost', () => {
  test('should be able to render cost correctly', () => {
    expect(formatCost(20)).toBe('$20.00')
  })

  test('should be able to render cost correctly with short form', () => {
    expect(
      formatCost(20, {
        shortFormat: true
      })
    ).toBe('$20.00')
  })

  test('should be able to render cost correctly with short form', () => {
    expect(
      formatCost(200, {
        shortFormat: true
      })
    ).toBe('$200.00')
  })

  test('should be able to render cost correctly with short form', () => {
    expect(
      formatCost(2000, {
        shortFormat: true
      })
    ).toBe('$2.00K')
  })

  test('should be able to render cost correctly with short form', () => {
    expect(
      formatCost(20000, {
        shortFormat: true
      })
    ).toBe('$20.0K')
  })

  test('should be able to render cost correctly with short form', () => {
    expect(
      formatCost(200000, {
        shortFormat: true
      })
    ).toBe('$200K')
  })

  test('should be able to render cost correctly with short form', () => {
    expect(
      formatCost(2241678, {
        shortFormat: true
      })
    ).toBe('$2.24M')
  })

  test('should be able to render cost correctly with short form', () => {
    expect(
      formatCost(22416781, {
        shortFormat: true
      })
    ).toBe('$22.4M')
  })

  test('should be able to render cost correctly with short form', () => {
    expect(
      formatCost(224167812, {
        shortFormat: true
      })
    ).toBe('$224M')
  })

  test('should be able to render cost correctly with short form', () => {
    expect(
      formatCost(2241678123, {
        shortFormat: true
      })
    ).toBe('$2.24B')
  })

  test('should be able to render cost correctly with short form', () => {
    expect(
      formatCost(22416781234, {
        shortFormat: true
      })
    ).toBe('$22.4B')
  })

  test('should be able to render cost correctly with short form', () => {
    expect(
      formatCost(224167812345, {
        shortFormat: true
      })
    ).toBe('$224B')
  })
})

describe('test cases for clusterInfoUtil', () => {
  test('should return values as expected', () => {
    expect(clusterInfoUtil()).toStrictEqual({ hasClusterAsSource: false, isClusterOnly: false })
    expect(clusterInfoUtil([])).toStrictEqual({ hasClusterAsSource: false, isClusterOnly: false })
    expect(clusterInfoUtil(['AWS'])).toStrictEqual({ hasClusterAsSource: false, isClusterOnly: false })
    expect(clusterInfoUtil(['CLUSTER'])).toStrictEqual({ hasClusterAsSource: true, isClusterOnly: true })
    expect(clusterInfoUtil(['AWS', 'CLUSTER'])).toStrictEqual({ hasClusterAsSource: true, isClusterOnly: false })
  })
})
