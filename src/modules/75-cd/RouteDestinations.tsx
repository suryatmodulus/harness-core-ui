import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'

import { RouteWithLayout } from '@common/router'
import { MinimalLayout } from '@common/layouts'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import {
  accountPathProps,
  projectPathProps,
  pipelinePathProps,
  triggerPathProps,
  connectorPathProps,
  secretPathProps,
  executionPathProps,
  inputSetFormPathProps,
  orgPathProps,
  modulePathProps,
  rolePathProps,
  resourceGroupPathProps
} from '@common/utils/routeUtils'
import type {
  AccountPathProps,
  PipelinePathProps,
  ExecutionPathProps,
  ProjectPathProps,
  PipelineType,
  ModulePathParams
} from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

import CDSideNav from '@cd/components/CDSideNav/CDSideNav'
import CDHomePage from '@cd/pages/home/CDHomePage'
import CDDashboardPage from '@cd/pages/dashboard/CDDashboardPage'
import DeploymentsList from '@cd/pages/deployments-list/DeploymentsList'
import CDPipelineStudio from '@cd/pages/pipeline-studio/CDPipelineStudio'
import PipelinesPage from '@pipeline/pages/pipelines/PipelinesPage'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import InputSetList from '@pipeline/pages/inputSet-list/InputSetList'
import TriggersPage from '@pipeline/pages/triggers/TriggersPage'
import TriggersWizardPage from '@pipeline/pages/triggers/TriggersWizardPage'
import ExecutionLandingPage from '@pipeline/pages/execution/ExecutionLandingPage/ExecutionLandingPage'
import ExecutionPipelineView from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionPipelineView'
import ExecutionArtifactsView from '@pipeline/pages/execution/ExecutionArtifactsView/ExecutionArtifactsView'
import ExecutionInputsView from '@pipeline/pages/execution/ExecutionInputsView/ExecutionInputsView'
import PipelineDetails from '@pipeline/pages/pipeline-details/PipelineDetails'
import TriggerDetails from '@pipeline/pages/trigger-details/TriggerDetails'
import CDTemplateLibraryPage from '@cd/pages/admin/template-library/CDTemplateLibraryPage'
import CDGitSyncPage from '@cd/pages/admin/git-sync/CDGitSyncPage'
import CDGovernancePage from '@cd/pages/admin/governance/CDGovernancePage'
import CDAccessControlPage from '@cd/pages/admin/access-control/CDAccessControlPage'
import CDGeneralSettingsPage from '@cd/pages/admin/general-settings/CDGeneralSettingsPage'
import ResourcesPage from '@cd/pages/Resources/ResourcesPage'
import CDPipelineDeploymentList from '@cd/pages/pipeline-deployment-list/CDPipelineDeploymentList'
import { ModuleName, useAppStore } from 'framework/exports'
import RunPipelinePage from '@pipeline/pages/RunPipeline/RunPipelinePage'
import { EnhancedInputSetForm } from '@pipeline/components/InputSetForm/InputSetForm'
import TriggersDetailPage from '@pipeline/pages/triggers/TriggersDetailPage'
import CreateConnectorFromYamlPage from '@connectors/pages/createConnectorFromYaml/CreateConnectorFromYamlPage'
import CreateSecretFromYamlPage from '@secrets/pages/createSecretFromYaml/CreateSecretFromYamlPage'
import ServiceDetailPage from '@dashboards/pages/ServiceDetailPage/ServiceDetailPage'

import RbacFactory from '@rbac/factories/RbacFactory'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { String } from 'framework/exports'

import './components/PipelineSteps'
import './components/PipelineStudio/DeployStage'
import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import UsersPage from '@rbac/pages/Users/UsersPage'
import ResourceGroups from '@rbac/pages/ResourceGroups/ResourceGroups'
import Roles from '@rbac/pages/Roles/Roles'
import RoleDetails from '@rbac/pages/RoleDetails/RoleDetails'
import ResourceGroupDetails from '@rbac/pages/ResourceGroupDetails/ResourceGroupDetails'
import UserGroups from '@rbac/pages/UserGroups/UserGroups'
import PipelineResourceModal from './components/RbacResourceModals/PipelineResourceModal/PipelineResourceModal'
import ServiceResourceModal from './components/RbacResourceModals/ServiceResourceModal/ServiceResourceModal'
import EnvironmentResourceModal from './components/RbacResourceModals/EnvironmentResourceModal/EnvironmentResourceModal'

RbacFactory.registerResourceTypeHandler(ResourceType.PIPELINE, {
  icon: 'pipeline',
  label: 'Pipeline',
  permissionLabels: {
    [PermissionIdentifier.VIEW_PIPELINE]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_PIPELINE]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_PIPELINE]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.EXECUTE_PIPELINE]: <String stringID="rbac.permissionLabels.execute" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <PipelineResourceModal {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.SERVICE, {
  icon: 'lock',
  label: 'Service',
  permissionLabels: {
    [PermissionIdentifier.VIEW_SERVICE]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_SERVICE]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_SERVICE]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.RUNTIMEACCESS_SERVICE]: <String stringID="rbac.permissionLabels.runtimeAccess" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <ServiceResourceModal {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.ENVIRONMENT, {
  icon: 'lock',
  label: 'Environment',
  permissionLabels: {
    [PermissionIdentifier.VIEW_ENVIRONMENT]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_ENVIRONMENT]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_ENVIRONMENT]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.RUNTIMEACCESS_ENVIRONMENT]: <String stringID="rbac.permissionLabels.runtimeAccess" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <EnvironmentResourceModal {...props} />
})

const RedirectToAccessControlHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams()

  return <Redirect to={routes.toUsers({ accountId, projectIdentifier, orgIdentifier, module })} />
}

const RedirectToCDHome = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()
  return <Redirect to={routes.toCDHome(params)} />
}

const RedirectToCDProject = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject?.modules?.includes(ModuleName.CD)) {
    return <Redirect to={routes.toCDProjectOverview(params)} />
  } else {
    return <Redirect to={routes.toCDHome(params)} />
  }
}

const RedirectToResourcesHome = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  return <Redirect to={routes.toCDResourcesConnectors(params)} />
}

const RedirectToPipelineDetailHome = (): React.ReactElement => {
  const params = useParams<PipelineType<PipelinePathProps>>()

  return <Redirect to={routes.toPipelineStudio(params)} />
}

const RedirectToExecutionPipeline = (): React.ReactElement => {
  const params = useParams<PipelineType<ExecutionPathProps>>()

  return <Redirect to={routes.toExecutionPipelineView(params)} />
}

const CDSideNavProps: SidebarContext = {
  navComponent: CDSideNav,
  subtitle: 'CONTINUOUS',
  title: 'Delivery',
  icon: 'cd-main'
}

const pipelineModuleParams: ModulePathParams = {
  module: ':module(cd)'
}

export default (
  <>
    <Route path={routes.toCD({ ...accountPathProps })} exact>
      <RedirectToCDHome />
    </Route>

    <Route path={routes.toCDProject({ ...accountPathProps, ...projectPathProps })} exact>
      <RedirectToCDProject />
    </Route>

    <RouteWithLayout sidebarProps={CDSideNavProps} path={routes.toCDHome({ ...accountPathProps })} exact>
      <CDHomePage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={routes.toCDProjectOverview({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <CDDashboardPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={routes.toDeployments({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
      exact
    >
      <DeploymentsList />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toPipelines({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
    >
      <PipelinesPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toServices({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
    >
      <ServiceDetailPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toRunPipeline({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <RunPipelinePage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      exact
      path={routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <PipelineDetails>
        <CDPipelineStudio />
      </PipelineDetails>
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toPipelineDeploymentList({
        ...accountPathProps,
        ...pipelinePathProps,
        ...pipelineModuleParams
      })}
    >
      <PipelineDetails>
        <CDPipelineDeploymentList />
      </PipelineDetails>
    </RouteWithLayout>
    <Route
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toCDResources({ ...accountPathProps, ...projectPathProps })}
    >
      <RedirectToResourcesHome />
    </Route>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toCDResourcesConnectors({ ...accountPathProps, ...projectPathProps })}
    >
      <ResourcesPage>
        <ConnectorsPage />
      </ResourcesPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toCreateConnectorFromYamlAtProjectLevel({ ...accountPathProps, ...projectPathProps })}
    >
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toCreateConnectorFromYamlAtOrgLevel({ ...accountPathProps, ...orgPathProps })}
    >
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toCDResourcesSecretsListing({ ...accountPathProps, ...projectPathProps })}
    >
      <ResourcesPage>
        <SecretsPage module="cd" />
      </ResourcesPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toCDResourcesConnectorDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...connectorPathProps
      })}
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toCDResourcesSecretDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps
      })}
    >
      <SecretDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={routes.toCreateSecretFromYaml({
        ...accountPathProps,
        ...projectPathProps,
        ...orgPathProps,
        ...modulePathProps
      })}
      exact
    >
      <CreateSecretFromYamlPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toInputSetList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <PipelineDetails>
        <InputSetList />
      </PipelineDetails>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toInputSetForm({ ...accountPathProps, ...inputSetFormPathProps, ...pipelineModuleParams })}
    >
      <EnhancedInputSetForm />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toTriggersPage({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <PipelineDetails>
        <TriggersPage />
      </PipelineDetails>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toTriggersWizardPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })}
    >
      <TriggerDetails>
        <TriggersWizardPage />
      </TriggerDetails>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toTriggersDetailPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })}
    >
      <TriggersDetailPage />
    </RouteWithLayout>

    <Route
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toExecution({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
    >
      <RedirectToExecutionPipeline />
    </Route>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      layout={MinimalLayout}
      path={routes.toExecutionPipelineView({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
    >
      <ExecutionLandingPage>
        <ExecutionPipelineView />
      </ExecutionLandingPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      layout={MinimalLayout}
      path={routes.toExecutionInputsView({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
    >
      <ExecutionLandingPage>
        <ExecutionInputsView />
      </ExecutionLandingPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      layout={MinimalLayout}
      path={routes.toExecutionArtifactsView({
        ...accountPathProps,
        ...executionPathProps,
        ...pipelineModuleParams
      })}
    >
      <ExecutionLandingPage>
        <ExecutionArtifactsView />
      </ExecutionLandingPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toPipelineDetail({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <RedirectToPipelineDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toCDTemplateLibrary({ ...accountPathProps, ...projectPathProps })}
    >
      <CDTemplateLibraryPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toCDGitSync({ ...accountPathProps, ...projectPathProps })}
    >
      <CDGitSyncPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toCDGovernance({ ...accountPathProps, ...projectPathProps })}
    >
      <CDGovernancePage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toCDAccessControl({ ...accountPathProps, ...projectPathProps })}
    >
      <CDAccessControlPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toCDGeneralSettings({ ...accountPathProps, ...projectPathProps })}
    >
      <CDGeneralSettingsPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={[routes.toAccessControl({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <RedirectToAccessControlHome />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={[routes.toUsers({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <UsersPage />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={[routes.toUserGroups({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <UserGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={[routes.toResourceGroups({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <ResourceGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={[routes.toRoles({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <Roles />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={[routes.toRoleDetails({ ...projectPathProps, ...pipelineModuleParams, ...rolePathProps })]}
      exact
    >
      <RoleDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={[
        routes.toResourceGroupDetails({ ...projectPathProps, ...pipelineModuleParams, ...resourceGroupPathProps })
      ]}
      exact
    >
      <ResourceGroupDetails />
    </RouteWithLayout>
  </>
)
