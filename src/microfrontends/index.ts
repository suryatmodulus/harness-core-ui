// eslint-disable-next-line import/order
import type React from 'react'
import type { PermissionsContextProps } from 'framework/rbac/PermissionsContext'
import type { LicenseStoreContextProps } from 'framework/LicenseStore/LicenseStoreContext'
import type { AppStoreContextProps } from 'framework/AppStore/AppStoreContext'
import type { NGBreadcrumbsProps } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ButtonProps } from '@rbac/components/Button/Button'
import type { Title, UseDocumentTitleReturn } from '@common/hooks/useDocumentTitle'

export interface Scope {
  accountId?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export interface CommonComponents {
  NGBreadcrumbs: React.ComponentType<Partial<NGBreadcrumbsProps>>
  RbacButton: React.ComponentType<ButtonProps>
}

export interface Hooks {
  useDocumentTitle(title: Title): UseDocumentTitleReturn
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
  components: CommonComponents
  hooks: Hooks
}

/**
 * function to render child app inside the parent
 */
export type ChildAppComponent = React.ComponentType<ChildAppProps>

export { AppStoreContextProps, LicenseStoreContextProps, PermissionsContextProps, ResourceType, PermissionIdentifier }
