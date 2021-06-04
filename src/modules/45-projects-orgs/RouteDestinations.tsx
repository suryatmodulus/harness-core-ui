import React from 'react'
import { useParams, Redirect } from 'react-router-dom'

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
  userPathProps,
  connectorPathProps
} from '@common/utils/routeUtils'

import ProjectsPage from '@projects-orgs/pages/projects/ProjectsPage'
import GetStartedProject from '@projects-orgs/pages/projects/views/GetStartedProject/GetStartedProject'

import ProjectDetails from '@projects-orgs/pages/projects/views/ProjectDetails/ProjectDetails'
import OrganizationsPage from '@projects-orgs/pages/organizations/OrganizationsPage'
import OrganizationDetailsPage from '@projects-orgs/pages/organizations/OrganizationDetails/OrganizationDetailsPage'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import ProjectDetailsSideNav from '@projects-orgs/components/ProjectsSideNav/ProjectsSideNav'
import RbacFactory from '@rbac/factories/RbacFactory'
import AddProjectResourceModalBody from '@projects-orgs/components/ProjectResourceModalBody/ProjectResourceModalBody'
import OrgResourceModalBody from '@projects-orgs/components/OrgResourceModalBody/OrgResourceModalBody'
import OrgsSideNav from '@projects-orgs/components/OrgSideNav/OrgSideNav'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
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
import CreateSecretFromYamlPage from '@secrets/pages/createSecretFromYaml/CreateSecretFromYamlPage'
import CreateConnectorFromYamlPage from '@connectors/pages/createConnectorFromYaml/CreateConnectorFromYamlPage'
import { HomeSideNavProps } from '@common/RouteDestinations'
import GitSyncEntityTab from '@gitsync/pages/entities/GitSyncEntityTab'
import GitSyncPage from '@gitsync/pages/GitSyncPage'
import GitSyncRepoTab from '@gitsync/pages/repos/GitSyncRepoTab'
import SessionToken from 'framework/utils/SessionToken'

const ProjectDetailsSideNavProps: SidebarContext = {
  navComponent: ProjectDetailsSideNav,
  icon: 'harness',
  title: 'Project Management'
}

const OrgsSideNavProps: SidebarContext = {
  navComponent: OrgsSideNav,
  icon: 'harness',
  title: 'Organization Management'
}

RbacFactory.registerResourceTypeHandler(ResourceType.PROJECT, {
  icon: 'nav-project',
  label: 'projectsText',
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
  label: 'orgsText',
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

const RedirectToAccessControlHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  return <Redirect to={routes.toUsers({ accountId, projectIdentifier, orgIdentifier })} />
}

const RedirectToGitSyncHome = (): React.ReactElement => {
  const accountId = SessionToken.accountId()
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  return <Redirect to={routes.toGitSyncReposAdmin({ projectIdentifier, accountId, orgIdentifier })} />
}

export default (
  <>
    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toProjects({ ...accountPathProps })} exact>
      <ProjectsPage />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toGetStarted({ ...accountPathProps })} exact>
      <GetStartedProject />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toProjectDetails({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <ProjectDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toConnectors({ ...projectPathProps })}
      exact
    >
      <ConnectorsPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toSecrets({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <SecretsPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toDelegatesDetails({ ...projectPathProps, ...delegatePathProps })}
      exact
    >
      <DelegateDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toDelegates({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <DelegatesPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toDelegateConfigsDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...delegateConfigProps
      })}
      exact
    >
      <DelegateProfileDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toConnectorDetails({ ...accountPathProps, ...projectPathProps, ...connectorPathProps })}
      exact
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={OrgsSideNavProps}
      path={routes.toConnectorDetails({ ...orgPathProps, ...connectorPathProps })}
      exact
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toSecretDetails({ ...accountPathProps, ...projectPathProps, ...secretPathProps })}
      exact
    >
      <RedirectToSecretDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toSecretDetailsOverview({ ...accountPathProps, ...projectPathProps, ...secretPathProps })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretDetails />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toSecretDetailsReferences({ ...accountPathProps, ...projectPathProps, ...secretPathProps })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretReferences />
      </SecretDetailsHomePage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toCreateSecretFromYaml({
        ...accountPathProps,
        ...projectPathProps,
        ...orgPathProps
      })}
      exact
    >
      <CreateSecretFromYamlPage />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toOrganizations({ ...accountPathProps })} exact>
      <OrganizationsPage />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={OrgsSideNavProps} path={routes.toConnectors({ ...orgPathProps })} exact>
      <ConnectorsPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={OrgsSideNavProps}
      path={routes.toConnectorDetails({ ...orgPathProps, ...connectorPathProps })}
      exact
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={OrgsSideNavProps} path={routes.toCreateConnectorFromYaml({ ...orgPathProps })} exact>
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={OrgsSideNavProps} path={routes.toSecrets({ ...orgPathProps })} exact>
      <SecretsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={OrgsSideNavProps}
      path={routes.toSecretDetails({
        ...orgPathProps,
        ...secretPathProps
      })}
      exact
    >
      <RedirectToSecretDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={OrgsSideNavProps}
      path={routes.toSecretDetailsOverview({
        ...orgPathProps,
        ...secretPathProps
      })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretDetails />
      </SecretDetailsHomePage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={OrgsSideNavProps}
      path={routes.toSecretDetailsReferences({
        ...orgPathProps,
        ...secretPathProps
      })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretReferences />
      </SecretDetailsHomePage>
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={OrgsSideNavProps} path={routes.toCreateSecretFromYaml({ ...orgPathProps })} exact>
      <CreateSecretFromYamlPage />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={OrgsSideNavProps} path={[routes.toAccessControl({ ...orgPathProps })]} exact>
      <RedirectToAccessControlHome />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={OrgsSideNavProps} path={[routes.toUsers({ ...orgPathProps })]} exact>
      <AccessControlPage>
        <UsersPage />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={OrgsSideNavProps}
      path={[routes.toUserDetails({ ...orgPathProps, ...userPathProps })]}
      exact
    >
      <UserDetails />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={OrgsSideNavProps} path={[routes.toUserGroups({ ...orgPathProps })]} exact>
      <AccessControlPage>
        <UserGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={OrgsSideNavProps}
      path={[routes.toUserGroupDetails({ ...orgPathProps, ...userGroupPathProps })]}
      exact
    >
      <UserGroupDetails />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={OrgsSideNavProps} path={[routes.toResourceGroups({ ...orgPathProps })]} exact>
      <AccessControlPage>
        <ResourceGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={OrgsSideNavProps} path={[routes.toRoles({ ...orgPathProps })]} exact>
      <AccessControlPage>
        <Roles />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={OrgsSideNavProps}
      path={[routes.toRoleDetails({ ...orgPathProps, ...rolePathProps })]}
      exact
    >
      <RoleDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={OrgsSideNavProps}
      path={[routes.toResourceGroupDetails({ ...orgPathProps, ...resourceGroupPathProps })]}
      exact
    >
      <ResourceGroupDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={OrgsSideNavProps}
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
      sidebarProps={ProjectDetailsSideNavProps}
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

    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      exact
      path={[routes.toGitSyncAdmin({ ...accountPathProps, ...projectPathProps })]}
    >
      <RedirectToGitSyncHome />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toGitSyncReposAdmin({ ...accountPathProps, ...projectPathProps })}
    >
      <GitSyncPage>
        <GitSyncRepoTab />
      </GitSyncPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toGitSyncEntitiesAdmin({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <GitSyncPage>
        <GitSyncEntityTab />
      </GitSyncPage>
    </RouteWithLayout>
  </>
)
