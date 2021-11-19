import type { StringKeys } from 'framework/strings'
import { getClusterTypes, getLogAnalysisTableData } from '../LogAnalysis.utils'
import { LogEvents } from '../LogAnalysis.types'
import { mockedLogsData, mockedLogsTableData } from './LogAnalysis.mocks'

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Unit tests for LogAnalysis utils', () => {
  test('Verify if getClusterTypes gives correct results', async () => {
    expect(getClusterTypes(getString)).toEqual([
      { label: 'pipeline.verification.logs.allEvents', value: '' },
      { label: 'pipeline.verification.logs.knownEvent', value: LogEvents.KNOWN },
      { label: 'pipeline.verification.logs.unknownEvent', value: LogEvents.UNKNOWN },
      { label: 'pipeline.verification.logs.unexpectedFrequency', value: LogEvents.UNEXPECTED }
    ])
  })

  test('Verify if getLogAnalysisTableData method gives the correct logs analysis Table data', async () => {
    expect(getLogAnalysisTableData(mockedLogsData)).toEqual(mockedLogsTableData)
  })
})
