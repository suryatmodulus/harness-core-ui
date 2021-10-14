import React from 'react'
import { useParams, useRouteMatch } from 'react-router-dom'

import type { ScopeDTO } from 'services/cd-ng'
import { PermissionsContext } from 'framework/rbac/PermissionsContext'
import { LicenseStoreContext } from 'framework/LicenseStore/LicenseStoreContext'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'

import type { ChildAppProps } from './microfrontendTypes'

export interface ChildAppMounterProps {
  ChildApp: (props: ChildAppProps) => React.ReactElement
}

export function ChildAppMounter(props: ChildAppMounterProps): React.ReactElement {
  const { ChildApp } = props
  const params = useParams<ScopeDTO>()

  // We use routeMatch instead of location because,
  // we want to pass the mount url and not the actual url
  const { url } = useRouteMatch()

  return (
    <ChildApp
      renderUrl={url}
      scope={params}
      parentContextObj={{
        appStoreContext: AppStoreContext,
        permissionsContext: PermissionsContext,
        licenseStoreProvider: LicenseStoreContext
      }}
    />
  )
}
