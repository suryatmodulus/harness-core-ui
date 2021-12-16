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
