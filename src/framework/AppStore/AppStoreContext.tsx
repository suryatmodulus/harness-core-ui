import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { fromPairs } from 'lodash-es'
import { Project, useGetProject, useGetUserInfo, UserInfo, isGitSyncEnabledPromise } from 'services/cd-ng'
import { useGetFeatureFlags } from 'services/portal'
import { PageSpinner } from '@common/components/Page/PageSpinner'

export type FeatureFlagMap = Record<string, boolean>

/**
 * Application Store - essential application-level states which are shareable
 * across Framework and Modules. These states are writeable within Frameworks.
 * Modules are allowed to read only.
 */
export interface AppStoreContextProps {
  readonly selectedProject?: Project
  readonly isGitSyncEnabled?: boolean
  readonly currentUserInfo: UserInfo
  /** feature flags */
  readonly featureFlags: FeatureFlagMap

  updateAppStore(
    data: Partial<Pick<AppStoreContextProps, 'selectedProject' | 'isGitSyncEnabled' | 'currentUserInfo'>>
  ): void
}

export const AppStoreContext = React.createContext<AppStoreContextProps>({
  featureFlags: {},
  currentUserInfo: {},
  isGitSyncEnabled: false,
  updateAppStore: () => void 0
})

export function useAppStore(): AppStoreContextProps {
  return React.useContext(AppStoreContext)
}

export function AppStoreProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const [state, setState] = React.useState<Omit<AppStoreContextProps, 'updateAppStore' | 'strings'>>({
    featureFlags: {},
    currentUserInfo: {},
    isGitSyncEnabled: false
  })

  const { data: featureFlags, loading: featureFlagsLoading } = useGetFeatureFlags({
    accountId,
    pathParams: { accountId },
    queryParams: ({ routingId: accountId } as unknown) as void // BE accepts this queryParam, but not declared in swagger
  })

  const { refetch, data: project } = useGetProject({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier
    },
    lazy: true
  })

  const { data: userInfo, loading: userInfoLoading } = useGetUserInfo({})

  React.useEffect(() => {
    setState(prevState => ({
      ...prevState,
      selectedProject: project?.data?.project
    }))
  }, [project?.data?.project])

  // update feature flags in context
  useEffect(() => {
    // TODO: Handle better if fetching feature flags fails
    if (featureFlags) {
      const featureFlagsMap = fromPairs(
        featureFlags?.resource?.map(flag => {
          return [flag.name, !!flag.enabled]
        })
      )

      // don't redirect on local because it goes into infinite loop
      // because there may be no current gen to go to
      if (!__DEV__ && !featureFlagsMap['NEXT_GEN_ENABLED']) {
        window.location.href = window.location.pathname.replace(/\/ng\//, '/')
      }

      setState(prevState => ({
        ...prevState,
        featureFlags: featureFlagsMap
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureFlags])

  React.useEffect(() => {
    if (projectIdentifier && state.featureFlags['GIT_SYNC_NG']) {
      isGitSyncEnabledPromise({
        queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
      }).then(status => {
        setState(prevState => ({
          ...prevState,
          isGitSyncEnabled: !!status
        }))
      })
    } else {
      setState(prevState => ({
        ...prevState,
        isGitSyncEnabled: false
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedProject, state.featureFlags['GIT_SYNC_NG']])

  React.useEffect(() => {
    if (projectIdentifier && orgIdentifier) {
      refetch()
    }
    if (!projectIdentifier || !orgIdentifier) {
      setState(prevState => ({
        ...prevState,
        selectedProject: undefined,
        isGitSyncEnabled: false
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdentifier, orgIdentifier])

  React.useEffect(() => {
    if (userInfo?.data) {
      const user = userInfo.data
      setState(prevState => ({
        ...prevState,
        currentUserInfo: user
      }))
    }
    //TODO: Logout if we don't have userInfo???
  }, [userInfo?.data])

  function updateAppStore(
    data: Partial<Pick<AppStoreContextProps, 'selectedProject' | 'isGitSyncEnabled' | 'currentUserInfo'>>
  ): void {
    setState(prevState => ({
      ...prevState,
      selectedProject: data.selectedProject || prevState?.selectedProject,
      isGitSyncEnabled: data.isGitSyncEnabled || prevState?.isGitSyncEnabled,
      currentUserInfo: data.currentUserInfo || prevState?.currentUserInfo
    }))
  }

  return (
    <AppStoreContext.Provider
      value={{
        ...state,
        updateAppStore
      }}
    >
      {featureFlagsLoading || userInfoLoading ? <PageSpinner /> : props.children}
    </AppStoreContext.Provider>
  )
}
