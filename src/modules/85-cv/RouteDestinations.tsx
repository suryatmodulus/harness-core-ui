import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'

import CVHomePage from '@cv/pages/home/CVHomePage'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  projectPathProps,
  connectorPathProps,
  secretPathProps,
  verificationPathProps,
  delegatePathProps,
  delegateConfigProps,
  resourceGroupPathProps,
  rolePathProps,
  userGroupPathProps,
  userPathProps,
  orgPathProps,
  modulePathProps,
  serviceAccountProps
} from '@common/utils/routeUtils'
import type { AccountPathProps, ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { MinimalLayout } from '@common/layouts'

import './components/PipelineSteps'
import CVDashboardPage from '@cv/pages/dashboard/CVDashboardPage'
import DeploymentDrilldownView from '@cv/pages/dashboard/deployment-drilldown/DeploymentDrilldownView'
import ActivityChangesDrilldownView from '@cv/pages/dashboard/activity-changes-drilldown/ActivityChangesDrilldownView'
import CVServicesPage from '@cv/pages/services/CVServicesPage'
import ActivitySourceSetup from '@cv/pages/onboarding/activity-source-setup/ActivitySourceSetup'
import ActivityDashBoardPage from '@cv/pages/activities/dashboard/ActivityDashBoardPage'
import CVSetupPage from '@cv/pages/admin/setup/CVSetupPage'
import MonitoringSource from '@cv/pages/monitoring-source/MonitoringSource'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import SideNav from '@cv/components/SideNav/SideNav'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import CreateConnectorFromYamlPage from '@connectors/pages/createConnectorFromYaml/CreateConnectorFromYamlPage'
import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import DelegatesPage from '@delegates/pages/delegates/DelegatesPage'
import DelegateDetails from '@delegates/pages/delegates/DelegateDetails'
import DelegateProfileDetails from '@delegates/pages/delegates/DelegateConfigurationDetailPage'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import { RedirectToSecretDetailHome } from '@secrets/RouteDestinations'
import SecretReferences from '@secrets/pages/secretReferences/SecretReferences'
import SecretDetailsHomePage from '@secrets/pages/secretDetailsHomePage/SecretDetailsHomePage'
import CVActivitySourcesPage from '@cv/pages/admin/activity-sources/CVActivitySourcesPage'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import ResourceGroupDetails from '@rbac/pages/ResourceGroupDetails/ResourceGroupDetails'
import ResourceGroups from '@rbac/pages/ResourceGroups/ResourceGroups'
import RoleDetails from '@rbac/pages/RoleDetails/RoleDetails'
import Roles from '@rbac/pages/Roles/Roles'
import UserDetails from '@rbac/pages/UserDetails/UserDetails'
import UserGroupDetails from '@rbac/pages/UserGroupDetails/UserGroupDetails'
import UserGroups from '@rbac/pages/UserGroups/UserGroups'
import UsersPage from '@rbac/pages/Users/UsersPage'
import ServiceAccountDetails from '@rbac/pages/ServiceAccountDetails/ServiceAccountDetails'
import ServiceAccountsPage from '@rbac/pages/ServiceAccounts/ServiceAccounts'
import CVVerificationJobsPage from './pages/admin/verification-jobs/CVVerificationJobsPage'
import CVMonitoringSourcesPage from './pages/admin/monitoring-sources/CVMonitoringSourcesPage'
import CVNotificationPage from './pages/admin/notifications/CVNotificationPage'
import VerificationJobs from './pages/verification-jobs/VerificationJobsSetup'
import CVTrialHomePage from './pages/home/CVTrialHomePage'

const RedirectToAccessControlHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  return <Redirect to={routes.toUsers({ accountId, projectIdentifier, orgIdentifier, module: 'cv' })} />
}

const RedirectToCVHome = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()

  return <Redirect to={routes.toCVHome(params)} />
}

const RedirectToCVProject = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject?.modules?.includes(ModuleName.CV)) {
    return (
      <Redirect
        to={routes.toCVProjectOverview({
          accountId: params.accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier
        })}
      />
    )
  } else {
    return <Redirect to={routes.toCVHome(params)} />
  }
}

const CVSideNavProps: SidebarContext = {
  navComponent: SideNav,
  subtitle: 'CONTINUOUS',
  title: 'Verification',
  icon: 'cv-main'
}

const cvModuleParams: ModulePathParams = {
  module: ':module(cv)'
}

export default (
  <>
    <Route path={routes.toCV({ ...accountPathProps })} exact>
      <RedirectToCVHome />
    </Route>
    <RouteWithLayout exact sidebarProps={CVSideNavProps} path={routes.toCVHome({ ...accountPathProps })}>
      <CVHomePage />
    </RouteWithLayout>

    <RouteWithLayout
      layout={MinimalLayout}
      path={routes.toModuleTrialHome({ ...accountPathProps, module: 'cv' })}
      exact
    >
      <CVTrialHomePage />
    </RouteWithLayout>

    <Route path={routes.toCVProject({ ...accountPathProps, ...projectPathProps })} exact>
      <RedirectToCVProject />
    </Route>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVProjectOverview({ ...accountPathProps, ...projectPathProps })}
    >
      <CVDashboardPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVDeploymentPage({
        ...accountPathProps,
        ...projectPathProps,
        serviceIdentifier: ':serviceIdentifier',
        deploymentTag: ':deploymentTag'
      })}
    >
      <DeploymentDrilldownView />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVActivityChangesPage({ ...accountPathProps, ...projectPathProps, activityId: ':activityId' })}
    >
      <ActivityChangesDrilldownView />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVServices({ ...accountPathProps, ...projectPathProps })}
    >
      <CVServicesPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={[
        routes.toCVActivitySourceSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource'
        }),
        routes.toCVActivitySourceEditSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource',
          activitySourceId: ':activitySourceId'
        })
      ]}
    >
      <ActivitySourceSetup />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVActivityDashboard({ ...accountPathProps, ...projectPathProps })}
    >
      <ActivityDashBoardPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVAdminSetup({ ...accountPathProps, ...projectPathProps })}
    >
      <CVSetupPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={[
        routes.toCVAdminSetupMonitoringSource({
          ...accountPathProps,
          ...projectPathProps,
          monitoringSource: ':monitoringSource'
        }),
        routes.toCVAdminSetupMonitoringSourceEdit({
          ...accountPathProps,
          ...projectPathProps,
          monitoringSource: ':monitoringSource',
          identifier: ':identifier'
        })
      ]}
    >
      <MonitoringSource />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVAdminActivitySources({ ...accountPathProps, ...projectPathProps })}
    >
      <CVActivitySourcesPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVAdminMonitoringSources({ ...accountPathProps, ...projectPathProps })}
    >
      <CVMonitoringSourcesPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVAdminVerificationJobs({ ...accountPathProps, ...projectPathProps })}
    >
      <CVVerificationJobsPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVAdminSetupVerificationJob({ ...accountPathProps, ...projectPathProps })}
    >
      <VerificationJobs />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVAdminSetupVerificationJobEdit({
        ...accountPathProps,
        ...projectPathProps,
        ...verificationPathProps
      })}
    >
      <VerificationJobs />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toConnectors({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })}
    >
      <ConnectorsPage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toSecrets({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })}
    >
      <SecretsPage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toDelegates({ ...accountPathProps, ...projectPathProps, ...cvModuleParams })}
    >
      <DelegatesPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toDelegatesDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...delegatePathProps,
        ...cvModuleParams
      })}
    >
      <DelegateDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toDelegateConfigsDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...delegateConfigProps,
        ...cvModuleParams
      })}
    >
      <DelegateProfileDetails />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toConnectorDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...connectorPathProps,
        ...cvModuleParams
      })}
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCreateConnectorFromYaml({ ...accountPathProps, ...projectPathProps, ...modulePathProps })}
    >
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCreateConnectorFromYaml({ ...accountPathProps, ...orgPathProps })}
    >
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toSecretDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...cvModuleParams
      })}
    >
      <RedirectToSecretDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toSecretDetailsOverview({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...cvModuleParams
      })}
    >
      <SecretDetailsHomePage>
        <SecretDetails />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toSecretDetailsReferences({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...cvModuleParams
      })}
    >
      <SecretDetailsHomePage>
        <SecretReferences />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVAdminNotifications({
        ...accountPathProps,
        ...projectPathProps
      })}
    >
      <CVNotificationPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CVSideNavProps}
      path={[routes.toAccessControl({ ...projectPathProps, ...cvModuleParams })]}
      exact
    >
      <RedirectToAccessControlHome />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CVSideNavProps}
      path={[routes.toUsers({ ...projectPathProps, ...cvModuleParams })]}
      exact
    >
      <AccessControlPage>
        <UsersPage />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CVSideNavProps}
      path={routes.toUserDetails({ ...projectPathProps, ...cvModuleParams, ...userPathProps })}
      exact
    >
      <UserDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CVSideNavProps}
      path={[routes.toUserGroups({ ...projectPathProps, ...cvModuleParams })]}
      exact
    >
      <AccessControlPage>
        <UserGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CVSideNavProps}
      path={routes.toUserGroupDetails({ ...projectPathProps, ...cvModuleParams, ...userGroupPathProps })}
      exact
    >
      <UserGroupDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CVSideNavProps}
      path={routes.toServiceAccounts({ ...projectPathProps, ...cvModuleParams })}
      exact
    >
      <AccessControlPage>
        <ServiceAccountsPage />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CVSideNavProps}
      path={routes.toServiceAccountDetails({ ...projectPathProps, ...cvModuleParams, ...serviceAccountProps })}
      exact
    >
      <ServiceAccountDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CVSideNavProps}
      path={[routes.toResourceGroups({ ...projectPathProps, ...cvModuleParams })]}
      exact
    >
      <AccessControlPage>
        <ResourceGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CVSideNavProps}
      path={[routes.toRoles({ ...projectPathProps, ...cvModuleParams })]}
      exact
    >
      <AccessControlPage>
        <Roles />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CVSideNavProps}
      path={[routes.toRoleDetails({ ...projectPathProps, ...cvModuleParams, ...rolePathProps })]}
      exact
    >
      <RoleDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CVSideNavProps}
      path={[routes.toResourceGroupDetails({ ...projectPathProps, ...cvModuleParams, ...resourceGroupPathProps })]}
      exact
    >
      <ResourceGroupDetails />
    </RouteWithLayout>
  </>
)
