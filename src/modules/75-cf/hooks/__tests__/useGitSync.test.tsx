/* eslint-disable jest-no-mock */
import { renderHook } from '@testing-library/react-hooks'

import * as cfServiceMock from 'services/cf'
import { useGitSync } from '../useGitSync'

jest.mock('services/cf')

jest.mock('react-router-dom', () => ({
  useParams: () => jest.fn()
}))

const setUseGitRepoMock = (): void => {
  jest.spyOn(cfServiceMock, 'useGetGitRepo').mockReturnValue({
    loading: false,
    refetch: jest.fn(),
    data: {
      repoDetails: {
        autoCommit: false,
        branch: 'main',
        filePath: '/flags.yaml',
        objectId: '',
        repoIdentifier: 'harnesstest',
        rootFolder: '/.harness/'
      },
      repoSet: true
    }
  } as any)
}

describe('useFeatureFlagTelemetry', () => {
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

    const { result } = renderHook(() => useGitSync())

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

    const { result } = renderHook(() => useGitSync())

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

  test('it should not call patch endpoint when auto commit value is the same', async () => {
    const patchMutateMock = jest.fn()

    jest.spyOn(cfServiceMock, 'usePatchGitRepo').mockReturnValue({
      loading: false,
      mutate: patchMutateMock
    } as any)

    const { result } = renderHook(() => useGitSync())

    result.current.handleAutoCommit(false)
    expect(patchMutateMock).not.toHaveBeenCalledWith()
  })
})
