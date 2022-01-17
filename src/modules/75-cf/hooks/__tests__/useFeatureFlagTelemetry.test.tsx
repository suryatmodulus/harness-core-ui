/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook, act } from '@testing-library/react-hooks'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useFeatureFlagTelemetry } from '../useFeatureFlagTelemetry'

jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: jest.fn(() => ({
    trackEvent: jest.fn(),
    identifyUser: jest.fn()
  }))
}))

describe('useFeatureFlagTelemetry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('it should return correct event functions', async () => {
    const { result } = renderHook(() => useFeatureFlagTelemetry())

    expect(Object.keys(result.current)).toHaveLength(3)
    expect(result.current).toHaveProperty('visitedPage')
    expect(result.current).toHaveProperty('createFeatureFlagStart')
    expect(result.current).toHaveProperty('createFeatureFlagCompleted')
  })

  test('it should call useTelemetry when visitedPage function invoked', async () => {
    const { result } = renderHook(() => useFeatureFlagTelemetry())
    act(() => {
      result.current.visitedPage()
    })
    expect(useTelemetry).toBeCalled()
  })

  test('it should call useTelemetry when createFeatureFlagStart function invoked', async () => {
    const { result } = renderHook(() => useFeatureFlagTelemetry())
    act(() => {
      result.current.createFeatureFlagStart()
    })
    expect(useTelemetry).toBeCalled()
  })

  test('it should call useTelemetry when createFeatureFlagCompleted function invoked', async () => {
    const { result } = renderHook(() => useFeatureFlagTelemetry())
    act(() => {
      result.current.createFeatureFlagCompleted()
    })
    expect(useTelemetry).toBeCalled()
  })
})
