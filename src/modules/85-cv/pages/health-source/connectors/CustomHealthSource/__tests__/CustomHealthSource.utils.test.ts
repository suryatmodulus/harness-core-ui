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
