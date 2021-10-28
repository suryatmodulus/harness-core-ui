import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { PermissionsContext } from 'framework/rbac/PermissionsContext'
import { LicenseStoreContext } from 'framework/LicenseStore/LicenseStoreContext'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { PageSpinner } from '@common/components'
import RbacButton from '@rbac/components/Button/Button'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'

import ChildAppError from './ChildAppError'
import type { ChildAppProps, Scope } from './index'

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
          components={{
            RbacButton,
            NGBreadcrumbs
          }}
          hooks={{
            useDocumentTitle
          }}
        />
      </React.Suspense>
    )
  }
}

export default withRouter(ChildAppMounter)
