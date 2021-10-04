import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { fromPairs } from 'lodash-es'
import {
  Project,
  useGetProject,
  useGetCurrentUserInfo,
  UserInfo,
  isGitSyncEnabledPromise,
  GitEnabledDTO,
  Organization,
  useGetOrganization
} from 'services/cd-ng'
import { useGetFeatureFlags } from 'services/portal'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { FeatureFlag } from '@common/featureFlags'

export type FeatureFlagMap = Partial<Record<FeatureFlag, boolean>>

/**
 * Application Store - essential application-level states which are shareable
 * across Framework and Modules. These states are writeable within Frameworks.
 * Modules are allowed to read only.
 */
export interface AppStoreContextProps {
  readonly selectedProject?: Project
  readonly selectedOrg?: Organization
  readonly isGitSyncEnabled?: boolean
  readonly connectivityMode?: GitEnabledDTO['connectivityMode'] //'MANAGER' | 'DELEGATE'
  readonly currentUserInfo: UserInfo
  /** feature flags */
  readonly featureFlags: FeatureFlagMap

  updateAppStore(
    data: Partial<
      Pick<
        AppStoreContextProps,
        'selectedOrg' | 'selectedProject' | 'isGitSyncEnabled' | 'connectivityMode' | 'currentUserInfo'
      >
    >
  ): void
}

export const AppStoreContext = React.createContext<AppStoreContextProps>({
  featureFlags: {},
  currentUserInfo: {},
  isGitSyncEnabled: false,
  connectivityMode: undefined,
  updateAppStore: () => void 0
})

export function useAppStore(): AppStoreContextProps {
  return React.useContext(AppStoreContext)
}

export function AppStoreProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [state, setState] = React.useState<Omit<AppStoreContextProps, 'updateAppStore' | 'strings'>>({
    featureFlags: {},
    currentUserInfo: {},
    isGitSyncEnabled: false,
    connectivityMode: undefined
  })

  const { data: featureFlags, loading: featureFlagsLoading } = useGetFeatureFlags({
    accountId,
    pathParams: { accountId }
  })

  const { refetch, data: project } = useGetProject({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier
    },
    lazy: true
  })
  const { refetch: refetchOrg, data: orgDetails } = useGetOrganization({
    identifier: orgIdentifier,
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })
  const { data: userInfo, loading: userInfoLoading } = useGetCurrentUserInfo({})

  useEffect(() => {
    // don't redirect on local because it goes into infinite loop
    // because there may be no current gen to go to
    const currentAccount = userInfo?.data?.accounts?.find(account => account.uuid === accountId)
    if (!__DEV__ && currentAccount && !currentAccount.nextGenEnabled) {
      const baseUrl = window.location.pathname.replace(/\/ng\//, '/')
      window.location.href = `${baseUrl}#/account/${accountId}/dashboard`
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.data?.accounts])

  // update feature flags in context
  useEffect(() => {
    // TODO: Handle better if fetching feature flags fails
    if (featureFlags) {
      const featureFlagsMap = fromPairs(
        featureFlags?.resource?.map(flag => {
          return [flag.name, !!flag.enabled]
        })
      )

      setState(prevState => ({
        ...prevState,
        featureFlags: featureFlagsMap as FeatureFlagMap
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureFlags])

  // update gitSyncEnabled when selectedProject changes
  useEffect(() => {
    if (projectIdentifier) {
      isGitSyncEnabledPromise({
        queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
      }).then((response: GitEnabledDTO) => {
        setState(prevState => ({
          ...prevState,
          isGitSyncEnabled: !!response?.gitSyncEnabled,
          connectivityMode: response?.connectivityMode
        }))
      })
    } else {
      setState(prevState => ({
        ...prevState,
        isGitSyncEnabled: false,
        connectivityMode: undefined
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedProject, projectIdentifier, orgIdentifier])

  // set selectedProject when projectDetails are fetched
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      selectedProject: project?.data?.project
    }))
  }, [project?.data?.project])
  // set selectedOrg when orgDetails are fetched
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      selectedOrg: orgDetails?.data?.organization
    }))
  }, [orgDetails?.data?.organization])
  // update selectedProject when projectIdentifier in URL changes
  useEffect(() => {
    if (projectIdentifier && orgIdentifier) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdentifier, orgIdentifier])
  // update selectedOrg when orgidentifier in url changes
  useEffect(() => {
    if (orgIdentifier) {
      refetchOrg()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgIdentifier])
  // clear selectedProject selectedOrg when accountId changes
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      selectedProject: undefined,
      selectedOrg: undefined
    }))
  }, [accountId])

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
    data: Partial<
      Pick<
        AppStoreContextProps,
        'selectedOrg' | 'selectedProject' | 'isGitSyncEnabled' | 'connectivityMode' | 'currentUserInfo'
      >
    >
  ): void {
    setState(prevState => ({
      ...prevState,
      selectedOrg: data.selectedOrg,
      selectedProject: data.selectedProject,
      isGitSyncEnabled: data.isGitSyncEnabled || prevState?.isGitSyncEnabled,
      connectivityMode: data.connectivityMode || prevState?.connectivityMode,
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
