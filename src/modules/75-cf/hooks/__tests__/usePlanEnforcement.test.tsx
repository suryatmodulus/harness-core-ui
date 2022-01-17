/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import usePlanEnforcement from '../usePlanEnforcement'

describe('usePlanEnforcement', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    [true, true, true],
    [false, false, true],
    [false, true, false],
    [false, false, false]
  ])(
    'it should return %p for isPlanEnforcementEnabled if FFM_1859 = %p and FEATURE_ENFORCEMENT_ENABLED = %p',
    async (expectedResult, FFM_1859, FEATURE_ENFORCEMENT_ENABLED) => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlags').mockReturnValue({ FFM_1859, FEATURE_ENFORCEMENT_ENABLED })

      const { result } = renderHook(() => usePlanEnforcement())

      expect(result.current.isPlanEnforcementEnabled).toBe(expectedResult)
    }
  )
})
