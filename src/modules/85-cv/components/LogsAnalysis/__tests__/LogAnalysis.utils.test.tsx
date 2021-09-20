import type { StringKeys } from 'framework/strings'
import { LogEvents } from '../LogAnalysis.constants'
import { getClusterTypes, mapClusterType } from '../LogAnalysis.utils'

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Unit tests for LogAnalysis utils', () => {
  test('Verify if mapClusterType gives correct results', async () => {
    expect(mapClusterType('KNOWN_EVENT')).toEqual('KNOWN')
    expect(mapClusterType('UNKNOWN_EVENT')).toEqual('UNKNOWN')
    expect(mapClusterType('UNEXPECTED_FREQUENCY')).toEqual('UNEXPECTED')
    expect(mapClusterType('default')).toEqual('KNOWN')
  })

  test('Verify if getClusterTypes gives correct results', async () => {
    expect(getClusterTypes(getString)).toEqual([
      { label: 'pipeline.verification.logs.allEvents', value: '' },
      { label: 'pipeline.verification.logs.knownEvent', value: LogEvents.KNOWN_EVENT },
      { label: 'pipeline.verification.logs.unknownEvent', value: LogEvents.UNKNOWN_EVENT },
      { label: 'pipeline.verification.logs.unexpectedFrequency', value: LogEvents.UNEXPECTED_FREQUENCY }
    ])
  })
})
