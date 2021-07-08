import React from 'react'

import { Redirect, useParams } from 'react-router-dom'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  rolePathProps,
  resourceGroupPathProps,
  userGroupPathProps,
  userPathProps,
  serviceAccountProps
} from '@common/utils/routeUtils'

import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import UsersPage from '@rbac/pages/Users/UsersPage'
import UserGroups from '@rbac/pages/UserGroups/UserGroups'
import Roles from '@rbac/pages/Roles/Roles'
import ResourceGroups from '@rbac/pages/ResourceGroups/ResourceGroups'
import { String } from 'framework/strings'
import RoleDetails from '@rbac/pages/RoleDetails/RoleDetails'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import UserGroupDetails from '@rbac/pages/UserGroupDetails/UserGroupDetails'
import ResourceGroupDetails from '@rbac/pages/ResourceGroupDetails/ResourceGroupDetails'
import RbacFactory from '@rbac/factories/RbacFactory'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import UserDetails from '@rbac/pages/UserDetails/UserDetails'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { HomeSideNavProps } from '@common/RouteDestinations'
import ServiceAccountsPage from './pages/ServiceAccounts/ServiceAccounts'
import ServiceAccountDetails from './pages/ServiceAccountDetails/ServiceAccountDetails'

RbacFactory.registerResourceCategory(ResourceCategory.SHARED_RESOURCES, {
  icon: 'support-tour',
  label: 'rbac.categoryLabels.sharedResources'
})

RbacFactory.registerResourceCategory(ResourceCategory.ADMINSTRATIVE_FUNCTIONS, {
  icon: 'support-account',
  label: 'adminFunctions'
})

RbacFactory.registerResourceTypeHandler(ResourceType.USER, {
  icon: 'nav-project',
  label: 'users',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_USER]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.MANAGE_USER]: <String stringID="rbac.permissionLabels.manage" />,
    [PermissionIdentifier.INVITE_USER]: <String stringID="rbac.permissionLabels.invite" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.USERGROUP, {
  icon: 'nav-project',
  label: 'common.userGroups',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_USERGROUP]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.MANAGE_USERGROUP]: <String stringID="rbac.permissionLabels.manage" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.RESOURCEGROUP, {
  icon: 'nav-project',
  label: 'resourceGroups',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_RESOURCEGROUP]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_RESOURCEGROUP]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_RESOURCEGROUP]: <String stringID="rbac.permissionLabels.delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.ROLE, {
  icon: 'nav-project',
  label: 'roles',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_ROLE]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_ROLE]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_ROLE]: <String stringID="rbac.permissionLabels.delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.AUTHSETTING, {
  icon: 'nav-settings',
  label: 'authSettings.authenticationSettings',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_AUTHSETTING]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_AUTHSETTING]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_AUTHSETTING]: <String stringID="rbac.permissionLabels.delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.SERVICEACCOUNT, {
  icon: 'nav-settings',
  label: 'rbac.serviceAccounts.label',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_SERVICEACCOUNT]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_SERVICEACCOUNT]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_SERVICEACCOUNT]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.MANAGE_SERVICEACCOUNT]: <String stringID="rbac.permissionLabels.manage" />
  }
})

const RedirectToAccessControlHome = (): React.ReactElement => {
  const { accountId } = useParams<AccountPathProps>()
  return <Redirect to={routes.toUsers({ accountId })} />
}

export default (
  <>
    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toAccessControl({ ...accountPathProps })} exact>
      <RedirectToAccessControlHome />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toServiceAccounts({ ...accountPathProps })} exact>
      <AccessControlPage>
        <ServiceAccountsPage />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={routes.toServiceAccountDetails({ ...accountPathProps, ...serviceAccountProps })}
      exact
    >
      <ServiceAccountDetails />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toUsers({ ...accountPathProps })} exact>
      <AccessControlPage>
        <UsersPage />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={routes.toUserDetails({ ...accountPathProps, ...userPathProps })}
      exact
    >
      <UserDetails />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toUserGroups({ ...accountPathProps })} exact>
      <AccessControlPage>
        <UserGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={routes.toUserGroupDetails({ ...accountPathProps, ...userGroupPathProps })}
      exact
    >
      <UserGroupDetails />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toResourceGroups({ ...accountPathProps })} exact>
      <AccessControlPage>
        <ResourceGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toRoles({ ...accountPathProps })} exact>
      <AccessControlPage>
        <Roles />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={routes.toRoleDetails({ ...accountPathProps, ...rolePathProps })}
      exact
    >
      <RoleDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={routes.toResourceGroupDetails({ ...accountPathProps, ...resourceGroupPathProps })}
      exact
    >
      <ResourceGroupDetails />
    </RouteWithLayout>
  </>
)
