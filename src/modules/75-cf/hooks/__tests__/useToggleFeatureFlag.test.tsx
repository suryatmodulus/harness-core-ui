/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable jest-no-mock */
import { renderHook } from '@testing-library/react-hooks'

import * as cfServiceMock from 'services/cf'
import { useToggleFeatureFlag } from '@cf/hooks/useToggleFeatureFlag'

jest.mock('services/cf')
jest.mock('@common/hooks/useFeatureFlag')

jest.mock('react-router-dom', () => ({
  useParams: () => jest.fn()
}))

describe('useToggleFeatureFlag', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('it should call mutate when toggling ON', async () => {
    const mutateMock = jest.fn()
    jest.spyOn(cfServiceMock, 'usePatchFeature').mockReturnValue({
      loading: false,
      mutate: mutateMock
    } as any)

    const { result } = renderHook(() =>
      useToggleFeatureFlag({
        accountIdentifier: '',
        environmentIdentifier: '',
        orgIdentifier: '',
        projectIdentifier: ''
      })
    )

    result.current.on('test-flag')

    expect(mutateMock).toHaveBeenCalledWith(
      {
        instructions: [
          {
            kind: 'setFeatureFlagState',
            parameters: {
              state: 'on'
            }
          }
        ]
      },
      { pathParams: { identifier: 'test-flag' } }
    )
  })

  test('it should call mutate when toggling OFF', async () => {
    const mutateMock = jest.fn()
    jest.spyOn(cfServiceMock, 'usePatchFeature').mockReturnValue({
      loading: false,
      mutate: mutateMock
    } as any)

    const { result } = renderHook(() =>
      useToggleFeatureFlag({
        accountIdentifier: '',
        environmentIdentifier: '',
        orgIdentifier: '',
        projectIdentifier: ''
      })
    )

    result.current.off('test-flag')

    expect(mutateMock).toHaveBeenCalledWith(
      {
        instructions: [
          {
            kind: 'setFeatureFlagState',
            parameters: {
              state: 'off'
            }
          }
        ]
      },
      { pathParams: { identifier: 'test-flag' } }
    )
  })

  test('it should call mutate with correct Git Details when toggling ON', async () => {
    const mutateMock = jest.fn()
    jest.spyOn(cfServiceMock, 'usePatchFeature').mockReturnValue({
      loading: false,
      mutate: mutateMock
    } as any)

    const { result } = renderHook(() =>
      useToggleFeatureFlag({
        accountIdentifier: '',
        environmentIdentifier: '',
        orgIdentifier: '',
        projectIdentifier: ''
      })
    )

    result.current.on('test-flag', {
      branch: 'test branch',
      filePath: '/test',
      repoIdentifier: 'test repo',
      rootFolder: '/test/test1',
      commitMsg: 'this is a test message'
    })

    expect(mutateMock).toHaveBeenCalledWith(
      {
        gitDetails: {
          commitMsg: 'this is a test message',
          branch: 'test branch',
          filePath: '/test',
          repoIdentifier: 'test repo',
          rootFolder: '/test/test1'
        },
        instructions: [
          {
            kind: 'setFeatureFlagState',
            parameters: {
              state: 'on'
            }
          }
        ]
      },
      { pathParams: { identifier: 'test-flag' } }
    )
  })

  test('it should call mutate with correct Git Details when toggling OFF', async () => {
    const mutateMock = jest.fn()
    jest.spyOn(cfServiceMock, 'usePatchFeature').mockReturnValue({
      loading: false,
      mutate: mutateMock
    } as any)

    const { result } = renderHook(() =>
      useToggleFeatureFlag({
        accountIdentifier: '',
        environmentIdentifier: '',
        orgIdentifier: '',
        projectIdentifier: ''
      })
    )

    result.current.off('test-flag', {
      branch: 'test branch',
      filePath: '/test',
      repoIdentifier: 'test repo',
      rootFolder: '/test/test1',
      commitMsg: 'this is a test message'
    })

    expect(mutateMock).toHaveBeenCalledWith(
      {
        gitDetails: {
          commitMsg: 'this is a test message',
          branch: 'test branch',
          filePath: '/test',
          repoIdentifier: 'test repo',
          rootFolder: '/test/test1'
        },
        instructions: [
          {
            kind: 'setFeatureFlagState',
            parameters: {
              state: 'off'
            }
          }
        ]
      },
      { pathParams: { identifier: 'test-flag' } }
    )
  })
})
