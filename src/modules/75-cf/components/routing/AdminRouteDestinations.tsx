/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import {
  pipelineModuleParams,
  projectPathProps,
  resourceGroupPathProps,
  rolePathProps,
  serviceAccountProps,
  userGroupPathProps,
  userPathProps
} from '@common/utils/routeUtils'
import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import ServiceAccountDetails from '@rbac/pages/ServiceAccountDetails/ServiceAccountDetails'
import ServiceAccountsPage from '@rbac/pages/ServiceAccounts/ServiceAccounts'
import UsersPage from '@rbac/pages/Users/UsersPage'
import UserDetails from '@rbac/pages/UserDetails/UserDetails'
import UserGroups from '@rbac/pages/UserGroups/UserGroups'
import UserGroupDetails from '@rbac/pages/UserGroupDetails/UserGroupDetails'
import ResourceGroups from '@rbac/pages/ResourceGroups/ResourceGroups'
import Roles from '@rbac/pages/Roles/Roles'
import RoleDetails from '@rbac/pages/RoleDetails/RoleDetails'
import ResourceGroupDetails from '@rbac/pages/ResourceGroupDetails/ResourceGroupDetails'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { CFSideNavProps } from '@cf/constants'
import { licenseRedirectData } from '@cf/components/routing/License'

const RedirectToAccessControlHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()

  return <Redirect to={routes.toUsers({ accountId, projectIdentifier, orgIdentifier, module })} />
}

const AdminRouteDestinations: FC = () => (
  <>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={[routes.toAccessControl({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <RedirectToAccessControlHome />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={[routes.toUsers({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <UsersPage />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toUserDetails({ ...projectPathProps, ...pipelineModuleParams, ...userPathProps })}
      exact
    >
      <UserDetails />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={[routes.toUserGroups({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <UserGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toUserGroupDetails({ ...projectPathProps, ...pipelineModuleParams, ...userGroupPathProps })}
      exact
    >
      <UserGroupDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toServiceAccounts({ ...projectPathProps, ...pipelineModuleParams })}
      exact
    >
      <AccessControlPage>
        <ServiceAccountsPage />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toServiceAccountDetails({ ...projectPathProps, ...pipelineModuleParams, ...serviceAccountProps })}
      exact
    >
      <ServiceAccountDetails />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={[routes.toResourceGroups({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <ResourceGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={[routes.toRoles({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <Roles />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={[routes.toRoleDetails({ ...projectPathProps, ...pipelineModuleParams, ...rolePathProps })]}
      exact
    >
      <RoleDetails />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={[
        routes.toResourceGroupDetails({ ...projectPathProps, ...pipelineModuleParams, ...resourceGroupPathProps })
      ]}
      exact
    >
      <ResourceGroupDetails />
    </RouteWithLayout>
  </>
)

export default AdminRouteDestinations
