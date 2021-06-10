import { MapGCPLogsToServiceFieldNames } from '../constants'
import { validateMappings } from '../utils'

function mockGetString(name: string): string {
  switch (name) {
    case 'cv.monitoringSources.envValidation':
      return MapGCPLogsToServiceFieldNames.ENVIRONMENT
    case 'cv.monitoringSources.metricNameValidation':
      return MapGCPLogsToServiceFieldNames.METRIC_NAME
    case 'cv.monitoringSources.gcoLogs.validation.serviceInstance':
      return MapGCPLogsToServiceFieldNames.SERVICE_INSTANCE
    case 'cv.monitoringSources.gcoLogs.validation.messageIdentifier':
      return MapGCPLogsToServiceFieldNames.MESSAGE_IDENTIFIER
    case 'cv.monitoringSources.gco.manualInputQueryModal.validation.query':
      return MapGCPLogsToServiceFieldNames.QUERY
    case 'cv.monitoringSources.serviceValidation':
      return MapGCPLogsToServiceFieldNames.SERVICE
    default:
      return ''
  }
}

describe('Unit tests for MapQueriesToHarnessService', () => {
  test('Ensure validation returns correctly', () => {
    // no values
    expect(validateMappings(mockGetString as any, [], 0)).toEqual({
      envIdentifier: MapGCPLogsToServiceFieldNames.ENVIRONMENT,
      messageIdentifier: MapGCPLogsToServiceFieldNames.MESSAGE_IDENTIFIER,
      query: MapGCPLogsToServiceFieldNames.QUERY,
      serviceIdentifier: MapGCPLogsToServiceFieldNames.SERVICE,
      serviceInstance: MapGCPLogsToServiceFieldNames.SERVICE_INSTANCE,
      metricName: ''
    })

    // some values
    expect(
      validateMappings(mockGetString as any, [], 0, {
        query: 'Test',
        metricName: 'adasd'
      })
    ).toEqual({
      envIdentifier: MapGCPLogsToServiceFieldNames.ENVIRONMENT,
      messageIdentifier: MapGCPLogsToServiceFieldNames.MESSAGE_IDENTIFIER,
      serviceIdentifier: MapGCPLogsToServiceFieldNames.SERVICE,
      serviceInstance: MapGCPLogsToServiceFieldNames.SERVICE_INSTANCE
    })

    // nonunique metricName
    expect(
      validateMappings(mockGetString as any, ['metric1', 'metric4'], 0, {
        query: 'sdfsdf',
        metricName: 'metric4'
      })
    ).toEqual({
      envIdentifier: MapGCPLogsToServiceFieldNames.ENVIRONMENT,
      messageIdentifier: MapGCPLogsToServiceFieldNames.MESSAGE_IDENTIFIER,
      serviceIdentifier: MapGCPLogsToServiceFieldNames.SERVICE,
      serviceInstance: MapGCPLogsToServiceFieldNames.SERVICE_INSTANCE,
      metricName: ''
    })
  })
})
