import * as cvServices from 'services/cv'
import type { MetricPackDTOArrayRequestBody } from 'services/cv'
import { HealthSoureSupportedConnectorTypes } from '../MonitoredServiceConnector.constants'
import { createMetricDataFormik, validateMetrics } from '../MonitoredServiceConnector.utils'
import { metricData, metricPack } from './MonitoredServiceConnector.mock'
describe('Validate util function', () => {
  test('Validate createMetricDataFormik', () => {
    expect(createMetricDataFormik(metricPack?.resource as MetricPackDTOArrayRequestBody)).toEqual({ Performance: true })
  })

  test('Validate validateMetrics', async () => {
    jest
      .spyOn(cvServices, 'getNewRelicMetricDataPromise')
      .mockImplementation(() => ({ error: null, data: { ...metricData.data } } as any))
    const { validationStatus, validationResult } = await validateMetrics(
      metricPack.resource as MetricPackDTOArrayRequestBody,
      {
        appId: '',
        appName: '',
        accountId: '',
        connectorIdentifier: 'connectorIdentifier',
        orgIdentifier: '',
        projectIdentifier: '',
        requestGuid: 'guid'
      },
      HealthSoureSupportedConnectorTypes.NEW_RELIC
    )
    expect(validationStatus).toEqual('success')
    expect(validationResult).toEqual([
      {
        metricPackName: 'Performance',
        overallStatus: 'SUCCESS',
        values: [
          { apiResponseStatus: 'SUCCESS', metricName: 'Calls per Minute', value: 0 },
          { apiResponseStatus: 'SUCCESS', metricName: 'Apdex', value: 1 },
          { apiResponseStatus: 'NO_DATA', metricName: 'Errors per Minute', value: null },
          { apiResponseStatus: 'NO_DATA', metricName: 'Average Response Time (ms)', value: null }
        ]
      }
    ])
  })
})
