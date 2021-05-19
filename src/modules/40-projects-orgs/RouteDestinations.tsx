import React from 'react'
import { useParams, Redirect, Route } from 'react-router-dom'

import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  delegatePathProps,
  orgPathProps,
  projectPathProps,
  delegateConfigProps,
  resourceGroupPathProps,
  rolePathProps,
  userGroupPathProps,
  secretPathProps,
  userPathProps
} from '@common/utils/routeUtils'
import { MinimalLayout } from '@common/layouts'

import ProjectsPage from '@projects-orgs/pages/projects/ProjectsPage'
import GetStartedProject from '@projects-orgs/pages/projects/views/GetStartedProject/GetStartedProject'

import ProjectDetails from '@projects-orgs/pages/projects/views/ProjectDetails/ProjectDetails'
import OrganizationsPage from '@projects-orgs/pages/organizations/OrganizationsPage'
import OrganizationDetailsPage from '@projects-orgs/pages/organizations/OrganizationDetails/OrganizationDetailsPage'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import AccountSettingsSideNav from '@common/navigation/AccountSettingsSideNav/AccountSettingsSideNav'
import ProjectDetailsSideNav from '@projects-orgs/components/ProjectsSideNav/ProjectsSideNav'
import RbacFactory from '@rbac/factories/RbacFactory'
import AddProjectResourceModalBody from '@projects-orgs/components/ProjectResourceModalBody/ProjectResourceModalBody'
import OrgResourceModalBody from '@projects-orgs/components/OrgResourceModalBody/OrgResourceModalBody'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ResourcesPage from '@common/pages/resources/ResourcesPage'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import DelegatesPage from '@delegates/pages/delegates/DelegatesPage'
import DelegateDetails from '@delegates/pages/delegates/DelegateDetails'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import { RedirectToSecretDetailHome } from '@secrets/RouteDestinations'
import SecretReferences from '@secrets/pages/secretReferences/SecretReferences'
import SecretDetailsHomePage from '@secrets/pages/secretDetailsHomePage/SecretDetailsHomePage'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import ResourceGroupDetails from '@rbac/pages/ResourceGroupDetails/ResourceGroupDetails'
import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import ResourceGroups from '@rbac/pages/ResourceGroups/ResourceGroups'
import RoleDetails from '@rbac/pages/RoleDetails/RoleDetails'
import Roles from '@rbac/pages/Roles/Roles'
import UserGroups from '@rbac/pages/UserGroups/UserGroups'
import UsersPage from '@rbac/pages/Users/UsersPage'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String } from 'framework/strings'
import UserGroupDetails from '@rbac/pages/UserGroupDetails/UserGroupDetails'
import UserDetails from '@rbac/pages/UserDetails/UserDetails'
import DelegateProfileDetails from '@delegates/pages/delegates/DelegateConfigurationDetailPage'

const AccountSettingsSideNavProps: SidebarContext = {
  navComponent: AccountSettingsSideNav,
  subtitle: 'ACCOUNT',
  title: 'Settings',
  icon: 'nav-settings'
}

const ProjectDetailsSideNavProps: SidebarContext = {
  navComponent: ProjectDetailsSideNav,
  icon: 'harness'
}

RbacFactory.registerResourceTypeHandler(ResourceType.PROJECT, {
  icon: 'nav-project',
  label: 'Projects',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_PROJECT]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_PROJECT]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.CREATE_PROJECT]: <String stringID="rbac.permissionLabels.create" />,
    [PermissionIdentifier.DELETE_PROJECT]: <String stringID="rbac.permissionLabels.delete" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <AddProjectResourceModalBody {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.ORGANIZATION, {
  icon: 'settings',
  label: 'Organizations',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_ORG]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_ORG]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.CREATE_ORG]: <String stringID="rbac.permissionLabels.create" />,
    [PermissionIdentifier.DELETE_ORG]: <String stringID="rbac.permissionLabels.delete" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <OrgResourceModalBody {...props} />
})
const RedirectToResourcesHome = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  return <Redirect to={routes.toResourcesConnectors(params)} />
}

const RedirectToAccessControlHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  return <Redirect to={routes.toUsers({ accountId, projectIdentifier, orgIdentifier })} />
}

export default (
  <>
    <RouteWithLayout layout={MinimalLayout} path={routes.toProjects({ ...accountPathProps })} exact>
      <ProjectsPage />
    </RouteWithLayout>

    <RouteWithLayout layout={MinimalLayout} path={routes.toProjectsGetStarted({ ...accountPathProps })} exact>
      <GetStartedProject />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toProjectDetails({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <ProjectDetails />
    </RouteWithLayout>

    <Route exact path={routes.toResources({ ...accountPathProps, ...projectPathProps })}>
      <RedirectToResourcesHome />
    </Route>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toResourcesConnectors({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <ResourcesPage>
        <ConnectorsPage />
      </ResourcesPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toResourcesSecrets({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <ResourcesPage>
        <SecretsPage />
      </ResourcesPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toResourcesDelegatesDetails({ ...projectPathProps, ...delegatePathProps })}
      exact
    >
      <ResourcesPage>
        <DelegateDetails />
      </ResourcesPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toResourcesDelegates({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <ResourcesPage>
        <DelegatesPage />
      </ResourcesPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toResourcesDelegateConfigsDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...delegateConfigProps
      })}
      exact
    >
      <ResourcesPage>
        <DelegateProfileDetails />
      </ResourcesPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toProjectResourcesConnectorDetails({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <ResourcesPage>
        <ConnectorDetailsPage />
      </ResourcesPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toResourcesSecretDetails({ ...accountPathProps, ...projectPathProps, ...secretPathProps })}
      exact
    >
      <RedirectToSecretDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toResourcesSecretDetailsOverview({ ...accountPathProps, ...projectPathProps, ...secretPathProps })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretDetails />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toResourcesSecretDetailsReferences({ ...accountPathProps, ...projectPathProps, ...secretPathProps })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretReferences />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={routes.toOrganizations({ ...accountPathProps })}
      exact
    >
      <OrganizationsPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={routes.toOrganizationDetails({ ...accountPathProps, ...orgPathProps })}
      exact
    >
      <OrganizationDetailsPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={[routes.toAccessControl({ ...projectPathProps })]}
      exact
    >
      <RedirectToAccessControlHome />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={ProjectDetailsSideNavProps} path={[routes.toUsers({ ...projectPathProps })]} exact>
      <AccessControlPage>
        <UsersPage />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={[routes.toUserDetails({ ...projectPathProps, ...userPathProps })]}
      exact
    >
      <UserDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={[routes.toUserGroups({ ...projectPathProps })]}
      exact
    >
      <AccessControlPage>
        <UserGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[routes.toUserGroupDetails({ ...projectPathProps, ...userGroupPathProps })]}
      exact
    >
      <UserGroupDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={[routes.toResourceGroups({ ...projectPathProps })]}
      exact
    >
      <AccessControlPage>
        <ResourceGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={ProjectDetailsSideNavProps} path={[routes.toRoles({ ...projectPathProps })]} exact>
      <AccessControlPage>
        <Roles />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={[routes.toRoleDetails({ ...projectPathProps, ...rolePathProps })]}
      exact
    >
      <RoleDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={[routes.toResourceGroupDetails({ ...projectPathProps, ...resourceGroupPathProps })]}
      exact
    >
      <ResourceGroupDetails />
    </RouteWithLayout>
  </>
)
