import type { AnalyzedLogDataDTO, RestResponsePageAnalyzedLogDataDTO } from 'services/cv'
import { getLogAnalysisTableData, roundOffRiskScore } from '../LogAnalysisContainer.utils'
import { mockedLogsData, mockedLogData, mockedLogsTableData } from './LogAnalysisContainer.mocks'

describe('Unit tests for LogAnalysisContainer Utils', () => {
  test('Verify if roundOffRiskScore method gives the correct score', async () => {
    expect(roundOffRiskScore(mockedLogData as AnalyzedLogDataDTO)).toEqual(0)
  })

  test('Verify if getLogAnalysisTableData method gives the correct logs analysis Table data', async () => {
    expect(getLogAnalysisTableData(mockedLogsData as RestResponsePageAnalyzedLogDataDTO)).toEqual(mockedLogsTableData)
  })
})
