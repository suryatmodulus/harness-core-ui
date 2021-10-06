// import type { UseCreateSecretModalReturn } from '../modules/30-secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import type { PermissionsContextProps } from '../framework/rbac/PermissionsContext'
import type { LicenseStoreContextProps } from '../framework/LicenseStore/LicenseStoreContext'
import type { AppStoreContextProps } from '../framework/AppStore/AppStoreContext'

/**Context names used in parent
 *
 */
export enum CONTEXT_NAMES {
  APPSTORE = 'APPSTORE',
  PERMISSIONS = 'PERMISSIONS',
  LICENSE = 'LICENSE'
}

export type SomeMap<T extends CONTEXT_NAMES> = T extends CONTEXT_NAMES.APPSTORE
  ? AppStoreContextProps
  : T extends CONTEXT_NAMES.LICENSE
  ? LicenseStoreContextProps
  : unknown
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

// type valueof<T> = T[keyof T]
// export type ContextData = valueof<ParentContextProps>

/**ParentContext Object which has parentcontext's and function which can be used by
 *  child to update the parent contexts
 *
 */
export interface ParentContextObj {
  parentContext: ParentContext
}

/** CommonComponents which is exposed by parent app and can be used in child app */
// export interface CommonComponents {
//   secrets: UseCreateSecretModalReturn
// }

export interface RenderChildAppProps {
  parentContextObj: ParentContextObj
  renderUrl: string
}

/**
 *
 */
export type RenderChildApp = (params: RenderChildAppProps) => React.Component
