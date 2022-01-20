/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import * as licenseStoreContextMock from 'framework/LicenseStore/LicenseStoreContext'
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

  test.each([
    [false, 'COMMUNITY'],
    [false, 'TEAM'],
    [false, 'ENTERPRISE']
  ])('it should return FALSE for isFreePlan if license store returns %p', async (expectedResult, isFreePlan) => {
    jest
      .spyOn(licenseStoreContextMock, 'useLicenseStore')
      .mockReturnValue({ licenseInformation: { CF: { edition: isFreePlan } } } as any)

    const { result } = renderHook(() => usePlanEnforcement())

    expect(result.current.isFreePlan).toBe(expectedResult)
  })

  test('it should return TRUE for isFreePlan is license store returns true', async () => {
    jest
      .spyOn(licenseStoreContextMock, 'useLicenseStore')
      .mockReturnValue({ licenseInformation: { CF: { edition: 'FREE' } } } as any)

    const { result } = renderHook(() => usePlanEnforcement())

    expect(result.current.isFreePlan).toBe(true)
  })
})
