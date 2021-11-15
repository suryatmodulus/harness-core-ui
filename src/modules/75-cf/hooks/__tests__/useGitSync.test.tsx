/* eslint-disable jest-no-mock */
import { renderHook } from '@testing-library/react-hooks'
import React, { FC } from 'react'
import { ModalProvider } from '@wings-software/uicore'
import * as cfServiceMock from 'services/cf'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import type { GitRepo } from 'services/cf'
import { useGitSync } from '../useGitSync'

jest.mock('services/cf')
jest.mock('@common/hooks/useFeatureFlag')
jest.mock('react-router-dom', () => ({
  useParams: () => jest.fn()
}))

const setUseGitRepoMock = (repoDetails: Partial<GitRepo> = {}, repoSet = false): void => {
  jest.spyOn(cfServiceMock, 'useGetGitRepo').mockReturnValue({
    loading: false,
    refetch: jest.fn(),
    data: {
      repoDetails: {
        autoCommit: repoDetails.autoCommit || false,
        branch: repoDetails.branch || 'main',
        enabled: repoDetails.enabled ?? true,
        filePath: repoDetails.filePath || '/flags.yaml',
        repoIdentifier: repoDetails.repoIdentifier || 'harnesstest',
        rootFolder: repoDetails.rootFolder || '/.harness/',
        yamlError: repoDetails.yamlError || ''
      },
      repoSet: repoSet
    }
  } as any)
}

const renderHookUnderTest = () => {
  const wrapper: FC = ({ children }) => {
    return <ModalProvider>{children}</ModalProvider>
  }
  return renderHook(() => useGitSync(), { wrapper })
}

describe('useGitSync', () => {
  beforeEach(() => {
    setUseGitRepoMock()
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('it should return correct getGitSyncFormMeta data', async () => {
    jest.spyOn(cfServiceMock, 'usePatchGitRepo').mockReturnValue({
      loading: false
    } as any)

    const { result } = renderHookUnderTest()

    const data = result.current.getGitSyncFormMeta()
    expect(data.gitSyncInitialValues).toEqual({
      gitDetails: {
        repoIdentifier: 'harnesstest',
        rootFolder: '/.harness/',
        branch: 'main',
        commitMsg: '',
        filePath: '/flags.yaml'
      },
      autoCommit: false
    })
  })

  test('it should call patch endpoint when auto commit value changed', async () => {
    const patchMutateMock = jest.fn()

    jest.spyOn(cfServiceMock, 'usePatchGitRepo').mockReturnValue({
      loading: false,
      mutate: patchMutateMock
    } as any)

    const { result } = renderHookUnderTest()

    result.current.handleAutoCommit(true)
    expect(patchMutateMock).toHaveBeenCalledWith({
      instructions: [
        {
          kind: 'setAutoCommit',
          parameters: {
            autoCommit: true
          }
        }
      ]
    })
  })

  test('it should call patch endpoint when Git Pause value changed', async () => {
    const patchMutateMock = jest.fn()

    jest.spyOn(cfServiceMock, 'usePatchGitRepo').mockReturnValue({
      loading: false,
      mutate: patchMutateMock
    } as any)

    const { result } = renderHookUnderTest()

    result.current.handleGitPause(true)
    expect(patchMutateMock).toHaveBeenCalledWith({
      instructions: [
        {
          kind: 'setEnabled',
          parameters: {
            enabled: true
          }
        }
      ]
    })
  })

  test('it should not call patch endpoint when auto commit value is the same', async () => {
    const patchMutateMock = jest.fn()

    jest.spyOn(cfServiceMock, 'usePatchGitRepo').mockReturnValue({
      loading: false,
      mutate: patchMutateMock
    } as any)

    const { result } = renderHookUnderTest()

    result.current.handleAutoCommit(false)
    expect(patchMutateMock).not.toHaveBeenCalledWith()
  })

  test('it should set API error correctly', async () => {
    const patchMutateMock = jest.fn()

    jest.spyOn(cfServiceMock, 'usePatchGitRepo').mockReturnValue({
      loading: false,
      mutate: patchMutateMock
    } as any)

    const { result } = renderHookUnderTest()

    result.current.handleError({ code: '424', message: 'TEST ERROR MESSAGE' })

    expect(result.current.apiError).toBe('TEST ERROR MESSAGE')
  })

  test.each([
    [true, true, true, true],
    [false, true, false, true],
    [false, true, true, false]
  ])(
    'it should return %p for isAutoCommitEnabled if FF_GITSYNC = %p, repoSet = %p, autoCommit = %p',
    async (expectedResult, ffGitSync, repoSet, autoCommit) => {
      setUseGitRepoMock({ autoCommit: autoCommit }, repoSet)

      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(ffGitSync)

      const { result } = renderHookUnderTest()

      expect(result.current.isAutoCommitEnabled).toBe(expectedResult)
    }
  )

  test.each([
    [true, true, true],
    [false, true, false],
    [false, false, false]
  ])(
    'it should return %p for isGitSyncEnabled if FF_GITSYNC = %p, repoSet = %p',
    async (expectedResult, ffGitSync, repoSet) => {
      setUseGitRepoMock({}, repoSet)

      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(ffGitSync)

      const { result } = renderHookUnderTest()

      expect(result.current.isGitSyncEnabled).toBe(expectedResult)
    }
  )
})
