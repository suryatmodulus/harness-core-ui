import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
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
  rolePathProps,
  resourceGroupPathProps,
  delegatePathProps,
  delegateConfigProps
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
import DeploymentsList from '@pipeline/pages/deployments-list/DeploymentsList'
import CDPipelineStudio from '@cd/pages/pipeline-studio/CDPipelineStudio'
import PipelinesPage from '@pipeline/pages/pipelines/PipelinesPage'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import DelegatesPage from '@delegates/pages/delegates/DelegatesPage'
import DelegateDetails from '@delegates/pages/delegates/DelegateDetails'
import DelegateProfileDetails from '@delegates/pages/delegates/DelegateConfigurationDetailPage'
import { RedirectToSecretDetailHome } from '@secrets/RouteDestinations'
import SecretReferences from '@secrets/pages/secretReferences/SecretReferences'
import SecretDetailsHomePage from '@secrets/pages/secretDetailsHomePage/SecretDetailsHomePage'
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
import CDGovernancePage from '@cd/pages/admin/governance/CDGovernancePage'
import CDGeneralSettingsPage from '@cd/pages/admin/general-settings/CDGeneralSettingsPage'
import CDPipelineDeploymentList from '@cd/pages/pipeline-deployment-list/CDPipelineDeploymentList'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { EnhancedInputSetForm } from '@pipeline/components/InputSetForm/InputSetForm'
import { RunPipelineModal } from '@pipeline/components/RunPipelineModal/RunPipelineModal'
import TriggersDetailPage from '@pipeline/pages/triggers/TriggersDetailPage'
import CreateConnectorFromYamlPage from '@connectors/pages/createConnectorFromYaml/CreateConnectorFromYamlPage'
import CreateSecretFromYamlPage from '@secrets/pages/createSecretFromYaml/CreateSecretFromYamlPage'
import ServiceDetailPage from '@dashboards/pages/ServiceDetailPage/ServiceDetailPage'

import './components/PipelineSteps'
import './components/PipelineStudio/DeployStage'
import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import UsersPage from '@rbac/pages/Users/UsersPage'
import ResourceGroups from '@rbac/pages/ResourceGroups/ResourceGroups'
import Roles from '@rbac/pages/Roles/Roles'
import RoleDetails from '@rbac/pages/RoleDetails/RoleDetails'
import ResourceGroupDetails from '@rbac/pages/ResourceGroupDetails/ResourceGroupDetails'
import UserGroups from '@rbac/pages/UserGroups/UserGroups'

import ResourcesPage from '@common/pages/resources/ResourcesPage'
import SessionToken from 'framework/utils/SessionToken'
import GitSyncPage from '@gitsync/pages/GitSyncPage'
import GitSyncRepoTab from '@gitsync/pages/repos/GitSyncRepoTab'
import GitSyncEntityTab from '@gitsync/pages/entities/GitSyncEntityTab'
import BuildTests from '@pipeline/pages/execution/ExecutionTestView/BuildTests'
import CDTrialHomePage from './pages/home/CDTrialHomePage'

const RedirectToAccessControlHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()

  return <Redirect to={routes.toUsers({ accountId, projectIdentifier, orgIdentifier, module })} />
}

const RedirectToCDHome = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()
  return <Redirect to={routes.toCDHome(params)} />
}

const RedirectToGitSyncHome = (): React.ReactElement => {
  const accountId = SessionToken.accountId()
  const { projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps & ModulePathParams>>()

  return <Redirect to={routes.toGitSyncReposAdmin({ projectIdentifier, accountId, orgIdentifier, module })} />
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

const CDDashboardPageOrRedirect = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()
  const { CD_OVERVIEW_PAGE } = useFeatureFlags()

  if (CD_OVERVIEW_PAGE) {
    return <CDDashboardPage />
  } else if (selectedProject?.modules?.includes(ModuleName.CD)) {
    return <Redirect to={routes.toDeployments({ ...params, module: 'cd' })} />
  } else {
    return <Redirect to={routes.toCDHome(params)} />
  }
}

const RedirectToResourcesHome = (): React.ReactElement => {
  const params = useParams<PipelineType<ProjectPathProps>>()
  return <Redirect to={routes.toResourcesConnectors(params)} />
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
      layout={MinimalLayout}
      path={routes.toModuleTrialHome({ ...accountPathProps, module: 'cd' })}
      exact
    >
      <CDTrialHomePage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={routes.toCDProjectOverview({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <CDDashboardPageOrRedirect />
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
      <PipelineDetails>
        <CDPipelineStudio />

        <RunPipelineModal />
      </PipelineDetails>
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
      path={routes.toResources({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
    >
      <RedirectToResourcesHome />
    </Route>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toResourcesConnectors({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
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
      path={routes.toResourcesSecrets({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
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
      path={routes.toResourcesSecretDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...pipelineModuleParams
      })}
    >
      <RedirectToSecretDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toResourcesSecretDetailsOverview({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...pipelineModuleParams
      })}
    >
      <SecretDetailsHomePage>
        <SecretDetails />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toResourcesSecretDetailsReferences({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...pipelineModuleParams
      })}
    >
      <SecretDetailsHomePage>
        <SecretReferences />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toResourcesDelegates({
        ...accountPathProps,
        ...projectPathProps,
        ...pipelineModuleParams
      })}
    >
      <DelegatesPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toResourcesDelegatesDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...delegatePathProps,
        ...connectorPathProps
      })}
    >
      <DelegateDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toResourcesDelegateConfigsDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...delegateConfigProps,
        ...pipelineModuleParams
      })}
    >
      <DelegateProfileDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={routes.toCreateSecretFromYaml({
        ...accountPathProps,
        ...projectPathProps,
        ...orgPathProps,
        ...pipelineModuleParams
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
      path={routes.toExecutionTestsView({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
    >
      <ExecutionLandingPage>
        <BuildTests />
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
      path={routes.toCDGovernance({ ...accountPathProps, ...projectPathProps })}
    >
      <CDGovernancePage />
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

    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      exact
      path={[routes.toGitSyncAdmin({ ...accountPathProps, ...pipelineModuleParams, ...projectPathProps })]}
    >
      <RedirectToGitSyncHome />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CDSideNavProps}
      path={routes.toGitSyncReposAdmin({ ...accountPathProps, ...pipelineModuleParams, ...projectPathProps })}
    >
      <GitSyncPage>
        <GitSyncRepoTab />
      </GitSyncPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CDSideNavProps}
      path={routes.toGitSyncEntitiesAdmin({ ...accountPathProps, ...pipelineModuleParams, ...projectPathProps })}
      exact
    >
      <GitSyncPage>
        <GitSyncEntityTab />
      </GitSyncPage>
    </RouteWithLayout>
  </>
)
