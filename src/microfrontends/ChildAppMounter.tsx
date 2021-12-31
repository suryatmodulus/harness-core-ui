import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { PermissionsContext } from 'framework/rbac/PermissionsContext'
import { LicenseStoreContext } from 'framework/LicenseStore/LicenseStoreContext'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { PageSpinner } from '@common/components'
import RbacButton from '@rbac/components/Button/Button'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import MonacoDiffEditor from '@common/components/MonacoDiffEditor/MonacoDiffEditor'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'

import ChildAppError from './ChildAppError'
import type { ChildAppProps, Scope } from './index'

const logger = loggerFor(ModuleName.FRAMEWORK)

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

  static getDerivedStateFromError(e: Error): ChildAppMounterState {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger.error(e.message, e as any)
    return { hasError: true }
  }

  render(): React.ReactElement {
    const { ChildApp, match } = this.props

    // We use routeMatch instead of location because,
    // we want to pass the mount url and not the actual url
    const { url, params, path } = match

    if (this.state.hasError) {
      return <ChildAppError />
    }

    return (
      <React.Suspense fallback={<PageSpinner />}>
        <ChildApp
          renderUrl={url}
          matchPath={path}
          scope={params}
          parentContextObj={{
            appStoreContext: AppStoreContext,
            permissionsContext: PermissionsContext,
            licenseStoreProvider: LicenseStoreContext
          }}
          components={{
            RbacButton,
            NGBreadcrumbs,
            MonacoEditor,
            YAMLBuilder,
            MonacoDiffEditor
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
