import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { fromPairs } from 'lodash-es'
import { Project, useGetProject } from 'services/cd-ng'
import { useGetFeatureFlags } from 'services/portal'
import { PageSpinner } from '@common/components/Page/PageSpinner'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StringsMap = Record<string, any>

export type FeatureFlagMap = Record<string, boolean>

/**
 * Application Store - essential application-level states which are shareable
 * across Framework and Modules. These states are writeable within Frameworks.
 * Modules are allowed to read only.
 */
export interface AppStoreContextProps {
  readonly selectedProject?: Project

  /** feature flags */
  readonly featureFlags: FeatureFlagMap

  /** strings for i18n */
  readonly strings: StringsMap

  updateAppStore(data: Partial<Pick<AppStoreContextProps, 'selectedProject'>>): void
}

export const AppStoreContext = React.createContext<AppStoreContextProps>({
  strings: {},
  featureFlags: {},
  updateAppStore: () => void 0
})

export function useAppStore(): AppStoreContextProps {
  return React.useContext(AppStoreContext)
}

export function AppStoreProvider(props: React.PropsWithChildren<{ strings: StringsMap }>): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const [state, setState] = React.useState<Omit<AppStoreContextProps, 'updateAppStore' | 'strings'>>({
    featureFlags: {}
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
  }, [featureFlags])

  React.useEffect(() => {
    if (projectIdentifier && orgIdentifier) refetch()
    if (!projectIdentifier || !orgIdentifier) {
      setState(prevState => ({
        ...prevState,
        selectedProject: undefined
      }))
    }
  }, [projectIdentifier, orgIdentifier])

  function updateAppStore(data: Partial<Pick<AppStoreContextProps, 'selectedProject'>>): void {
    setState(prevState => ({
      ...prevState,
      selectedProject: data.selectedProject || prevState?.selectedProject
    }))
  }

  return (
    <AppStoreContext.Provider
      value={{
        ...state,
        strings: props.strings,
        updateAppStore
      }}
    >
      {featureFlagsLoading ? <PageSpinner /> : props.children}
    </AppStoreContext.Provider>
  )
}
