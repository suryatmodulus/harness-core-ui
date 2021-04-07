import React, { useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'

import { noop } from 'lodash-es'
import { GitSyncConfig, useListGitSync } from 'services/cd-ng'
import { PageSpinner } from '@common/components/Page/PageSpinner'

export interface GitSyncStoreProps {
  readonly gitSyncRepos: GitSyncConfig[]
  updateStore(data: Partial<Pick<GitSyncStoreProps, 'gitSyncRepos'>>): void
  refreshStore(): void
}

export const GitSyncStoreContext = React.createContext<GitSyncStoreProps>({
  gitSyncRepos: [],
  updateStore: noop,
  refreshStore: noop
})

export const useGitSyncStore = (): GitSyncStoreProps => {
  return React.useContext(GitSyncStoreContext)
}

export const GitSyncStoreProvider: React.FC = props => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams()

  //Note: right now we support git-sync only at project level
  const { data: dataAllGitSync, loading: loadingRepos, refetch } = useListGitSync({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const [storeData, setStoreData] = React.useState<Omit<GitSyncStoreProps, 'updateStore' | 'strings'>>({
    gitSyncRepos: [],
    refreshStore: refetch
  })

  useEffect(() => {
    if (projectIdentifier) {
      setStoreData(prevStateData => ({
        ...prevStateData,
        gitSyncRepos: dataAllGitSync || []
      }))
    }
  }, [dataAllGitSync, projectIdentifier])

  const updateStore = useCallback(
    () => (data: Partial<Pick<GitSyncStoreProps, 'gitSyncRepos'>>): void => {
      setStoreData(prevState => ({
        ...prevState,
        gitSyncRepos: data.gitSyncRepos || prevState.gitSyncRepos
      }))
    },
    []
  )

  return (
    <GitSyncStoreContext.Provider
      value={{
        ...storeData,
        updateStore
      }}
    >
      {loadingRepos ? <PageSpinner /> : props.children}
    </GitSyncStoreContext.Provider>
  )
}
