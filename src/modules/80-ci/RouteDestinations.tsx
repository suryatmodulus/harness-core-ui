import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'
import { RouteWithLayout } from '@common/router'
import {
  accountPathProps,
  projectPathProps,
  pipelinePathProps,
  connectorPathProps,
  secretPathProps,
  inputSetFormPathProps,
  triggerPathProps,
  executionPathProps,
  modulePathProps,
  orgPathProps,
  rolePathProps,
  resourceGroupPathProps
} from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import type {
  ExecutionPathProps,
  PipelinePathProps,
  PipelineType,
  ProjectPathProps,
  ModulePathParams
} from '@common/interfaces/RouteInterfaces'

import DeploymentsList from '@cd/pages/deployments-list/DeploymentsList'
import CIHomePage from '@ci/pages/home/CIHomePage'
import CIDashboardPage from '@ci/pages/dashboard/CIDashboardPage'
import CIPipelineStudio from '@ci/pages/pipeline-studio/CIPipelineStudio'
import PipelinesPage from '@pipeline/pages/pipelines/PipelinesPage'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import CISideNav from '@ci/components/CISideNav/CISideNav'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import ResourcesPage from '@ci/pages/Resources/ResourcesPage'
import CIPipelineDeploymentList from '@ci/pages/pipeline-deployment-list/CIPipelineDeploymentList'
import { useAppStore, ModuleName } from 'framework/exports'
import PipelineDetails from '@pipeline/pages/pipeline-details/PipelineDetails'
import InputSetList from '@pipeline/pages/inputSet-list/InputSetList'
import TriggersPage from '@pipeline/pages/triggers/TriggersPage'
import { EnhancedInputSetForm } from '@pipeline/components/InputSetForm/InputSetForm'
import TriggerDetails from '@pipeline/pages/trigger-details/TriggerDetails'
import ExecutionArtifactsView from '@pipeline/pages/execution/ExecutionArtifactsView/ExecutionArtifactsView'
import ExecutionInputsView from '@pipeline/pages/execution/ExecutionInputsView/ExecutionInputsView'
import ExecutionLandingPage from '@pipeline/pages/execution/ExecutionLandingPage/ExecutionLandingPage'
import ExecutionPipelineView from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionPipelineView'
import TriggersWizardPage from '@pipeline/pages/triggers/TriggersWizardPage'
import TriggersDetailPage from '@pipeline/pages/triggers/TriggersDetailPage'
import RunPipelinePage from '@pipeline/pages/RunPipeline/RunPipelinePage'
import BuildTests from '@ci/pages/build/sections/tests/BuildTests'
import BuildCommits from '@ci/pages/build/sections/commits/BuildCommits'
import CreateSecretFromYamlPage from '@secrets/pages/createSecretFromYaml/CreateSecretFromYamlPage'
import { String } from 'framework/exports'

import './components/PipelineSteps'
import './components/PipelineStudio/BuildStage'
import SessionToken from 'framework/utils/SessionToken'
import GitSyncPage from '@gitsync/pages/GitSyncPage'
import GitSyncRepoTab from '@gitsync/pages/repos/GitSyncRepoTab'
import GitSyncEntityTab from '@gitsync/pages/entities/GitSyncEntityTab'
import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import UsersPage from '@rbac/pages/Users/UsersPage'
import ResourceGroups from '@rbac/pages/ResourceGroups/ResourceGroups'
import Roles from '@rbac/pages/Roles/Roles'
import RoleDetails from '@rbac/pages/RoleDetails/RoleDetails'
import ResourceGroupDetails from '@rbac/pages/ResourceGroupDetails/ResourceGroupDetails'
import UserGroups from '@rbac/pages/UserGroups/UserGroups'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import PipelineResourceModal from '@cd/components/RbacResourceModals/PipelineResourceModal/PipelineResourceModal'
import ServiceResourceModal from '@cd/components/RbacResourceModals/ServiceResourceModal/ServiceResourceModal'
import EnvironmentResourceModal from '@cd/components/RbacResourceModals/EnvironmentResourceModal/EnvironmentResourceModal'

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

const RedirectToCIHome = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  return <Redirect to={routes.toCIHome(params)} />
}

const RedirectToCIProject = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject?.modules?.includes(ModuleName.CI)) {
    return <Redirect to={routes.toCIProjectOverview(params)} />
  } else {
    return <Redirect to={routes.toCIHome(params)} />
  }
}
const RedirectToExecutionPipeline = (): React.ReactElement => {
  const params = useParams<PipelineType<ExecutionPathProps>>()

  return <Redirect to={routes.toExecutionPipelineView(params)} />
}

const RedirectToResourcesHome = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  return <Redirect to={routes.toCIAdminResourcesConnectors(params)} />
}

const RedirectToPipelineDetailHome = (): React.ReactElement => {
  const params = useParams<PipelineType<PipelinePathProps>>()

  return <Redirect to={routes.toPipelineStudio(params)} />
}

const RedirectToGitSyncHome = (): React.ReactElement => {
  const accountId = SessionToken.accountId()
  const { projectIdentifier, orgIdentifier } = useParams()

  return <Redirect to={routes.toGitSyncReposAdmin({ projectIdentifier, accountId, orgIdentifier })} />
}

const CISideNavProps: SidebarContext = {
  navComponent: CISideNav,
  subtitle: 'CONTINUOUS',
  title: 'Integration',
  icon: 'ci-main'
}

const pipelineModuleParams: ModulePathParams = {
  module: ':module(ci)'
}

export default (
  <>
    <Route path={routes.toCI({ ...accountPathProps })} exact>
      <RedirectToCIHome />
    </Route>

    <Route path={routes.toCIProject({ ...accountPathProps, ...projectPathProps })} exact>
      <RedirectToCIProject />
    </Route>

    <RouteWithLayout sidebarProps={CISideNavProps} path={[routes.toCIHome({ ...accountPathProps })]} exact>
      <CIHomePage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CISideNavProps}
      path={routes.toCIProjectOverview({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <CIDashboardPage />
    </RouteWithLayout>
    {/* <RouteWithLayout path={routes.toCIBuilds({ ...accountPathProps, ...projectPathProps })} exact>
        <CIBuildList />
      </RouteWithLayout>

      <Route path={routes.toCIBuild({ ...accountPathProps, ...projectPathProps, ...buildPathProps })} exact>
        <RedirectToBuildPipelineGraph />
      </Route>

      <BuildSubroute
        path={routes.toCIBuildPipelineGraph({ ...accountPathProps, ...projectPathProps, ...buildPathProps })}
        component={<PipelineGraph />}
      />
      <BuildSubroute
        path={routes.toCIBuildPipelineLog({ ...accountPathProps, ...projectPathProps, ...buildPathProps })}
        component={<PipelineLog />}
      />
      <BuildSubroute
        path={routes.toCIBuildArtifacts({ ...accountPathProps, ...projectPathProps, ...buildPathProps })}
        component={<BuildArtifacts />}
      />
      <BuildSubroute
        path={routes.toCIBuildTests({ ...accountPathProps, ...projectPathProps, ...buildPathProps })}
        component={<BuildTests />}
      />
      <BuildSubroute
        path={routes.toCIBuildInputs({ ...accountPathProps, ...projectPathProps, ...buildPathProps })}
        component={<BuildInputs />}
      />
      <BuildSubroute
        path={routes.toCIBuildCommits({ ...accountPathProps, ...projectPathProps, ...buildPathProps })}
        component={<BuildCommits />}
      /> */}
    <Route
      sidebarProps={CISideNavProps}
      exact
      path={routes.toCIAdminResources({ ...accountPathProps, ...projectPathProps })}
    >
      <RedirectToResourcesHome />
    </Route>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toCIAdminResourcesConnectors({ ...accountPathProps, ...projectPathProps })}
    >
      <ResourcesPage>
        <ConnectorsPage />
      </ResourcesPage>
    </RouteWithLayout>

    <Route
      sidebarProps={CISideNavProps}
      exact
      path={routes.toGitSyncAdmin({ ...accountPathProps, ...projectPathProps })}
    >
      <RedirectToGitSyncHome />
    </Route>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toGitSyncReposAdmin({ ...accountPathProps, ...projectPathProps })}
    >
      <GitSyncPage>
        <GitSyncRepoTab />
      </GitSyncPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CISideNavProps}
      path={routes.toGitSyncEntitiesAdmin({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <GitSyncPage>
        <GitSyncEntityTab />
      </GitSyncPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toCIAdminResourcesSecretsListing({ ...accountPathProps, ...projectPathProps })}
    >
      <ResourcesPage>
        <SecretsPage module="ci" />
      </ResourcesPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CISideNavProps}
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
      sidebarProps={CISideNavProps}
      path={routes.toCIAdminResourcesConnectorDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...connectorPathProps
      })}
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toCIAdminResourcesSecretDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps
      })}
    >
      <SecretDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CISideNavProps}
      exact
      path={routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <PipelineDetails>
        <CIPipelineStudio />
      </PipelineDetails>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toPipelines({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
    >
      <PipelinesPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toInputSetList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <PipelineDetails>
        <InputSetList />
      </PipelineDetails>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CISideNavProps}
      path={routes.toDeployments({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
      exact
    >
      <DeploymentsList />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toInputSetForm({ ...accountPathProps, ...inputSetFormPathProps, ...pipelineModuleParams })}
    >
      <EnhancedInputSetForm />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toTriggersPage({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <PipelineDetails>
        <TriggersPage />
      </PipelineDetails>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toTriggersDetailPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })}
    >
      <TriggersDetailPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CISideNavProps}
      path={routes.toTriggersWizardPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })}
    >
      <TriggerDetails>
        <TriggersWizardPage />
      </TriggerDetails>
    </RouteWithLayout>
    <Route
      exact
      sidebarProps={CISideNavProps}
      path={routes.toExecution({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
    >
      <RedirectToExecutionPipeline />
    </Route>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toRunPipeline({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <RunPipelinePage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toExecutionPipelineView({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
    >
      <ExecutionLandingPage>
        <ExecutionPipelineView />
      </ExecutionLandingPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toExecutionInputsView({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
    >
      <ExecutionLandingPage>
        <ExecutionInputsView />
      </ExecutionLandingPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
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
      sidebarProps={CISideNavProps}
      path={routes.toExecutionTestsView({
        ...accountPathProps,
        ...executionPathProps,
        ...pipelineModuleParams
      })}
    >
      <ExecutionLandingPage>
        <BuildTests />
      </ExecutionLandingPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toExecutionCommitsView({
        ...accountPathProps,
        ...executionPathProps,
        ...pipelineModuleParams
      })}
    >
      <ExecutionLandingPage>
        <BuildCommits />
      </ExecutionLandingPage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toPipelineDeploymentList({
        ...accountPathProps,
        ...pipelinePathProps,
        ...pipelineModuleParams
      })}
    >
      <PipelineDetails>
        <CIPipelineDeploymentList />
      </PipelineDetails>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toPipelineDetail({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <RedirectToPipelineDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toCIPipelineDeploymentList({
        ...accountPathProps,
        ...pipelinePathProps
      })}
    >
      <CIPipelineDeploymentList />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toPipelineDetail({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <RedirectToPipelineDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CISideNavProps}
      path={routes.toCIPipelineDeploymentList({
        ...accountPathProps,
        ...pipelinePathProps
      })}
    >
      <CIPipelineDeploymentList />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CISideNavProps}
      path={[routes.toAccessControl({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <RedirectToAccessControlHome />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CISideNavProps}
      path={[routes.toUsers({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <UsersPage />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CISideNavProps}
      path={[routes.toUserGroups({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <UserGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CISideNavProps}
      path={[routes.toResourceGroups({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <ResourceGroups />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CISideNavProps}
      path={[routes.toRoles({ ...projectPathProps, ...pipelineModuleParams })]}
      exact
    >
      <AccessControlPage>
        <Roles />
      </AccessControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CISideNavProps}
      path={[routes.toRoleDetails({ ...projectPathProps, ...rolePathProps })]}
      exact
    >
      <RoleDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CISideNavProps}
      path={[
        routes.toResourceGroupDetails({ ...projectPathProps, ...pipelineModuleParams, ...resourceGroupPathProps })
      ]}
      exact
    >
      <ResourceGroupDetails />
    </RouteWithLayout>
  </>
)
