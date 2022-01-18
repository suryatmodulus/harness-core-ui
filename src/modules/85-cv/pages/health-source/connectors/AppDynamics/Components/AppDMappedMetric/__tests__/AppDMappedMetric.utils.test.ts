/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  updateSelectedMetricsMap,
  initializeGroupNames,
  getBasePathValue,
  getMetricPathValue
} from '../AppDMappedMetric.utils'
import { appdMetric, mappedMetricsMap, expectedMappedMetrics, formikValues } from './AppDMappedMetric.mock'

describe('Validate  utils functions', () => {
  test('should validate updateSelectedMetricsMap', () => {
    const { selectedMetric, mappedMetrics } = updateSelectedMetricsMap({
      updatedMetric: 'appdMetric new',
      oldMetric: 'appdMetric',
      mappedMetrics: mappedMetricsMap,
      formikValues
    })
    expect(selectedMetric).toEqual('appdMetric new')
    expect(mappedMetrics).toEqual(expectedMappedMetrics)
  })

  test('should validate getBasePathValue and getMetricPathValue', () => {
    expect(getBasePathValue(appdMetric.basePath)).toEqual('Overall Application Performance')
    expect(getMetricPathValue(appdMetric.metricPath)).toEqual('Calls per Minute')
  })

  test('should validate initializeGroupNames', () => {
    expect(initializeGroupNames(mappedMetricsMap, val => val)).toEqual([
      { label: 'cv.addNew', value: '' },
      { label: 'g1', value: 'g1' },
      { label: 'g2', value: 'g2' }
    ])
  })
})
