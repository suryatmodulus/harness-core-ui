/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
