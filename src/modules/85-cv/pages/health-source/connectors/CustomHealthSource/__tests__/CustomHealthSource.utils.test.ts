/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  validateMappings,
  transformCustomHealthSourceToSetupSource,
  transformCustomSetupSourceToHealthSource,
  initializeSelectedMetricsMap,
  initializeCreatedMetrics
} from '../CustomHealthSource.utils'
import {
  customHealthSourceData,
  mappedValue,
  mockedHealthSourcePayload,
  noErrorValidatation,
  transformedSetupSource
} from './CustomHealthSource.mock'

const transformHealthSourceMap = new Map()
transformHealthSourceMap.set('CustomHealth Metric 101', mappedValue)

describe('Validate utils', () => {
  test('verify transformPrometheusHealthSourceToSetupSource', () => {
    expect(transformCustomHealthSourceToSetupSource(customHealthSourceData)).toEqual(transformedSetupSource)
  })

  test('verify transformCustomSetupSourceToHealthSource', () => {
    expect(
      transformCustomSetupSourceToHealthSource({
        isEdit: true,
        connectorRef: 'customhealth',
        healthSourceIdentifier: 'New_Custom',
        healthSourceName: 'New Custom',
        mappedServicesAndEnvs: transformHealthSourceMap
      })
    ).toEqual(mockedHealthSourcePayload)
  })

  test('should verify validateMappings', () => {
    expect(validateMappings(val => val, ['CustomHealth Metric 101'], 0, noErrorValidatation as any)).toEqual({})
  })

  test('should validate createAppDFormData', () => {
    const { selectedMetric, mappedMetrics } = initializeSelectedMetricsMap(
      'CustomHealth Metric',
      transformHealthSourceMap
    )
    expect(selectedMetric).toEqual('CustomHealth Metric 101')
    expect(mappedMetrics).toEqual(transformHealthSourceMap)

    const { createdMetrics, selectedMetricIndex } = initializeCreatedMetrics(
      'CustomHealth Metric',
      selectedMetric,
      mappedMetrics
    )

    expect(createdMetrics).toEqual(['CustomHealth Metric 101'])
    expect(selectedMetricIndex).toEqual(0)
  })
})
