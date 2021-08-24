import * as utils from '../statusHelpers'

describe('statusHelpers tests', () => {
  describe('isExecutionComplete tests', () => {
    test.each<[utils.ExecutionStatus]>([
      ['Aborted'],
      ['Expired'],
      ['Failed'],
      ['Success'],
      ['Suspended']
      // ['ApprovalRejected']
    ])('Status "%s" marks stage as complete', status => {
      expect(utils.isExecutionComplete(status)).toBe(true)
    })
  })

  describe('isExecutionActive  tests', () => {
    test.each<[utils.ExecutionStatus]>([['Paused'], ['Running'], ['ResourceWaiting'], ['Queued']])(
      'Status "%s" marks stage as in-progress',
      status => {
        expect(utils.isExecutionActive(status)).toBe(true)
      }
    )
  })
})
