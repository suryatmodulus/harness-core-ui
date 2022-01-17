/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ModuleName } from 'framework/types/ModuleName'
import { loggerFor } from '../logging'

describe('logging tests', () => {
  test('log test', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation()
    const logger = loggerFor(ModuleName.COMMON)
    expect(logger).toBeDefined()
    logger.error('error reported')
    expect(spy).toBeCalled()
    spy.mockRestore()
  })
})
