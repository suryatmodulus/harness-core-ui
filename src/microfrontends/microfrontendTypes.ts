// eslint-disable-next-line import/order
import type { PermissionsContextProps } from 'framework/rbac/PermissionsContext'
import type { LicenseStoreContextProps } from 'framework/LicenseStore/LicenseStoreContext'
import type { AppStoreContextProps } from 'framework/AppStore/AppStoreContext'

/**
 * Parent contexts which consists of all the context used in the parent app
 */
export interface ParentContext {
  appStoreContext: React.Context<AppStoreContextProps>
  permissionsContext: React.Context<PermissionsContextProps>
  licenseStoreProvider: React.Context<LicenseStoreContextProps>
}
export interface ParentContextProps {
  appStoreContext: AppStoreContextProps
  permissionsContext: PermissionsContextProps
  licenseStoreProvider: LicenseStoreContextProps
}

/**ParentContext Object which has parentcontext's and function which can be used by
 *  child to update the parent contexts
 *
 */
export interface ParentContextObj {
  parentContext: ParentContext
}

export interface RenderChildAppProps {
  parentContextObj: ParentContextObj
  renderUrl: string
}

/**
 * function to render child app inside the parent
 */
export type RenderChildApp = (params: RenderChildAppProps) => React.ReactElement
export { AppStoreContextProps, LicenseStoreContextProps, PermissionsContextProps }
