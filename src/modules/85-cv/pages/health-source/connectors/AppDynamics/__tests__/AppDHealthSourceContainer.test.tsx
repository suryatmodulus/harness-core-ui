/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createAppDynamicsData } from '../AppDHealthSource.utils'
import { sourceData, expectedAppDynamicData } from './AppDMonitoredSource.mock'

describe('Test AppDynamics Utils', () => {
  test('Verify createAppDynamicsData', () => {
    expect(createAppDynamicsData(sourceData)).toEqual(expectedAppDynamicData)
  })
})
