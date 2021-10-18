import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { PermissionsContext } from 'framework/rbac/PermissionsContext'
import { LicenseStoreContext } from 'framework/LicenseStore/LicenseStoreContext'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { PageSpinner } from '@common/components'

import type { ChildAppProps, Scope } from './microfrontendTypes'
import ChildAppError from './ChildAppError'

export interface ChildAppMounterProps extends RouteComponentProps<Scope> {
  ChildApp: React.LazyExoticComponent<React.ComponentType<ChildAppProps>>
}

export interface ChildAppMounterState {
  hasError: boolean
}

export class ChildAppMounter extends React.Component<ChildAppMounterProps, ChildAppMounterState> {
  state: ChildAppMounterState = {
    hasError: false
  }

  static getDerivedStateFromError(): ChildAppMounterState {
    return { hasError: true }
  }

  render(): React.ReactElement {
    const { ChildApp, match } = this.props

    // We use routeMatch instead of location because,
    // we want to pass the mount url and not the actual url
    const { url, params } = match

    if (this.state.hasError) {
      return <ChildAppError />
    }

    return (
      <React.Suspense fallback={<PageSpinner />}>
        <ChildApp
          renderUrl={url}
          scope={params}
          parentContextObj={{
            appStoreContext: AppStoreContext,
            permissionsContext: PermissionsContext,
            licenseStoreProvider: LicenseStoreContext
          }}
        />
      </React.Suspense>
    )
  }
}

export default withRouter(ChildAppMounter)
