import { createLogSection, getLogsFromBlob, getStageType } from '../LogsContentUtils'

const fetchMock = jest.spyOn(global, 'fetch' as any)

describe('LogsContentUtils', () => {
  test('getStageType', () => {
    const ci = getStageType({ moduleInfo: { ci: {} } })
    expect(ci).toBe('ci')
    const cd = getStageType({ moduleInfo: { cd: {} } })
    expect(cd).toBe('cd')
    const unknown = getStageType({ moduleInfo: {} })
    expect(unknown).toBe('unknown')
  })

  test('logBlobPromise', async () => {
    const fetchSpy = fetchMock.mockResolvedValue({
      text: () => new Promise(resolve => resolve('{"out":"message"}')),
      headers: { get: () => 'text/plain' }
    })

    const response = await getLogsFromBlob({ key: '123', accountID: '123', 'X-Harness-Token': '123' })
    expect(response).toStrictEqual([{ out: 'message' }])

    fetchSpy.mockClear()
  })

  test('createLogSection (basic test)', async () => {
    const response = createLogSection(
      'ci',
      'logsToken',
      'accountId',
      'orgIdentifier',
      'projectIdentifier',
      'runSequence',
      'pipelineIdentifier',
      'stageIdentifier',
      'Running',
      'stepIdentifier',
      'Running',
      'step'
    )

    const expectedResponse = [
      {
        enableLogLoading: true,
        sectionTitle: 'Logs',
        sectionIdx: 0,
        sourceType: 'stream',
        queryVars: {
          'X-Harness-Token': 'logsToken',
          accountID: 'accountId',
          key: 'accountId/orgIdentifier/projectIdentifier/pipelineIdentifier/runSequence/stageIdentifier/stepIdentifier'
        }
      }
    ]

    expect(response).toStrictEqual(expectedResponse)
  })
})
