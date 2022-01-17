/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ModuleName } from 'framework/types/ModuleName'
import { getModuleTitle } from '../utils'

describe('Testcase for utils', () => {
  test('Validate getModuleTitle', () => {
    expect(getModuleTitle(ModuleName.CV)).toEqual('projectsOrgs.purposeList.change')
    expect(getModuleTitle(ModuleName.CD)).toEqual('projectsOrgs.purposeList.continuous')
  })
})
