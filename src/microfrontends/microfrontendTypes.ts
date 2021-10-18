// eslint-disable-next-line import/order
import type React from 'react'
import type { PermissionsContextProps } from 'framework/rbac/PermissionsContext'
import type { LicenseStoreContextProps } from 'framework/LicenseStore/LicenseStoreContext'
import type { AppStoreContextProps } from 'framework/AppStore/AppStoreContext'

export interface Scope {
  accountId?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

/**
 * Parent contexts which consists of all the context used in the parent app
 */
export interface ParentContext {
  appStoreContext: React.Context<AppStoreContextProps>
  permissionsContext: React.Context<PermissionsContextProps>
  licenseStoreProvider: React.Context<LicenseStoreContextProps>
}

export interface ChildAppProps {
  parentContextObj: ParentContext
  renderUrl: string
  scope: Scope
}

/**
 * function to render child app inside the parent
 */
export type ChildAppComponent = React.ComponentType<ChildAppProps>

export { AppStoreContextProps, LicenseStoreContextProps, PermissionsContextProps }
