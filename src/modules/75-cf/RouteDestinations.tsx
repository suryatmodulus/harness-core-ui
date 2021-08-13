import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'

import { RouteWithLayout } from '@common/router'
// import SidebarProvider from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  featureFlagPathProps,
  projectPathProps,
  environmentPathProps,
  connectorPathProps,
  secretPathProps,
  segmentPathProps,
  targetPathProps,
  pipelinePathProps,
  pipelineModuleParams,
  executionPathProps,
  inputSetFormPathProps,
  triggerPathProps,
  modulePathProps
} from '@common/utils/routeUtils'
import type {
  AccountPathProps,
  ExecutionPathProps,
  Module,
  ModulePathParams,
  PipelinePathProps,
  PipelineType,
  ProjectPathProps
} from '@common/interfaces/RouteInterfaces'
import { MinimalLayout } from '@common/layouts'
import DeploymentsList from '@pipeline/pages/deployments-list/DeploymentsList'
import CFHomePage from '@cf/pages/home/CFHomePage'
import FeatureFlagsPage from '@cf/pages/feature-flags/FeatureFlagsPage'
import FeatureFlagsDetailPage from '@cf/pages/feature-flags-detail/FeatureFlagsDetailPage'
import EnvironmentsPage from '@cf/pages/environments/EnvironmentsPage'
import EnvironmentDetails from '@cf/pages/environment-details/EnvironmentDetails'
import CFWorkflowsPage from '@cf/pages/workflows/CFWorkflowsPage'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import { RedirectToSecretDetailHome } from '@secrets/RouteDestinations'
import SecretReferences from '@secrets/pages/secretReferences/SecretReferences'
import SecretDetailsHomePage from '@secrets/pages/secretDetailsHomePage/SecretDetailsHomePage'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import PipelineDetails from '@pipeline/pages/pipeline-details/PipelineDetails'
import PipelinesPage from '@pipeline/pages/pipelines/PipelinesPage'
import InputSetList from '@pipeline/pages/inputSet-list/InputSetList'
//import DeploymentsList from '@cd/pages/deployments-list/DeploymentsList'
import { EnhancedInputSetForm } from '@pipeline/components/InputSetForm/InputSetForm'
import TriggersPage from '@pipeline/pages/triggers/TriggersPage'
import TriggersDetailPage from '@pipeline/pages/triggers/TriggersDetailPage'
import TriggerDetails from '@pipeline/pages/trigger-details/TriggerDetails'
import TriggersWizardPage from '@pipeline/pages/triggers/TriggersWizardPage'
import ExecutionLandingPage from '@pipeline/pages/execution/ExecutionLandingPage/ExecutionLandingPage'
import ExecutionPipelineView from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionPipelineView'
import ExecutionInputsView from '@pipeline/pages/execution/ExecutionInputsView/ExecutionInputsView'
import ExecutionArtifactsView from '@pipeline/pages/execution/ExecutionArtifactsView/ExecutionArtifactsView'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import AdminRouteDestinations from '@cf/components/routing/AdminRouteDestinations'
import { CFSideNavProps } from '@cf/constants'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import CreateConnectorFromYamlPage from '@connectors/pages/createConnectorFromYaml/CreateConnectorFromYamlPage'
import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import CreateSecretFromYamlPage from '@secrets/pages/createSecretFromYaml/CreateSecretFromYamlPage'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String } from 'framework/strings'
import { LicenseRedirectProps, LICENSE_STATE_NAMES } from 'framework/LicenseStore/LicenseStoreContext'
import { TargetsPage } from './pages/target-management/targets/TargetsPage'
import CFPipelineStudio from './pages/pipeline-studio/CFPipelineStudio'
import { TargetDetailPage } from './pages/target-details/TargetDetailPage'
import { SegmentsPage } from './pages/target-management/segments/SegmentsPage'
import { SegmentDetailPage } from './pages/segment-details/SegmentDetailPage'
import { OnboardingPage } from './pages/onboarding/OnboardingPage'
import { OnboardingDetailPage } from './pages/onboarding/OnboardingDetailPage'

import './pages/pipeline-studio/views/FeatureFlagStage'
import './components/PipelineSteps/index'
import CFTrialHomePage from './pages/home/CFTrialHomePage'
import CFPipelineDeploymentList from './pages/pipeline-deployment-list/CFPipelineDeploymentList'
import { CFPipelineContainer } from './pages/pipeline-studio/CFPipelineContainer'

const RedirectToCFHome = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()

  return <Redirect to={routes.toCFHome(params)} />
}

const RedirectToCFProject = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject?.modules?.includes(ModuleName.CF)) {
    return <Redirect to={routes.toCFFeatureFlags(params)} />
  } else {
    return <Redirect to={routes.toCFHome(params)} />
  }
}

const RedirectToExecutionPipeline = (): React.ReactElement => {
  const params = useParams<PipelineType<ExecutionPathProps>>()

  return <Redirect to={routes.toExecutionPipelineView(params)} />
}

const RedirectToPipelineDetailHome = (): React.ReactElement => {
  const params = useParams<PipelineType<PipelinePathProps>>()

  return <Redirect to={routes.toPipelineStudio(params)} />
}

const RedirectToTargets = (): React.ReactElement => {
  const { withActiveEnvironment } = useActiveEnvironment()
  const params = useParams<ProjectPathProps & AccountPathProps>()

  return <Redirect to={withActiveEnvironment(routes.toCFTargets(params))} />
}

const cfModuleParams: ModulePathParams = {
  module: ':module(cf)'
}

const RedirectToModuleTrialHome = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toModuleTrialHome({
        accountId,
        module: 'cf'
      })}
    />
  )
}

const RedirectToSubscriptions = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toSubscriptions({
        accountId,
        moduleCard: ModuleName.CF.toLowerCase() as Module
      })}
    />
  )
}

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.FF_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHome,
  expiredTrialRedirect: RedirectToSubscriptions
}

RbacFactory.registerResourceCategory(ResourceCategory.FEATUREFLAG_FUNCTIONS, {
  icon: 'nav-cf',
  label: 'cf.rbac.category'
})

RbacFactory.registerResourceTypeHandler(ResourceType.FEATUREFLAG, {
  icon: 'nav-cf',
  label: 'cf.rbac.featureflag.label',
  category: ResourceCategory.FEATUREFLAG_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.TOGGLE_FF_FEATUREFLAG]: <String stringID="cf.rbac.featureflag.toggle" />,
    [PermissionIdentifier.EDIT_FF_FEATUREFLAG]: <String stringID="cf.rbac.featureflag.edit" />,
    [PermissionIdentifier.DELETE_FF_FEATUREFLAG]: <String stringID="cf.rbac.featureflag.delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.TARGETGROUP, {
  icon: 'nav-cf',
  label: 'cf.rbac.targetgroup.label',
  category: ResourceCategory.FEATUREFLAG_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.EDIT_FF_TARGETGROUP]: <String stringID="cf.rbac.targetgroup.edit" />,
    [PermissionIdentifier.DELETE_FF_TARGETGROUP]: <String stringID="cf.rbac.targetgroup.delete" />
  }
})

export default (
  <>
    <Route licenseRedirectData={licenseRedirectData} path={routes.toCF({ ...accountPathProps })} exact>
      <RedirectToCFHome />
    </Route>

    <Route
      licenseRedirectData={licenseRedirectData}
      path={routes.toCFProject({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <RedirectToCFProject />
    </Route>

    <RouteWithLayout
      layout={MinimalLayout}
      path={routes.toModuleTrialHome({ ...accountPathProps, module: 'cf' })}
      exact
    >
      <CFTrialHomePage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toCFHome({ ...accountPathProps })}
      exact
    >
      <CFHomePage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toCFFeatureFlags({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <FeatureFlagsPage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toCFFeatureFlagsDetail({
        ...accountPathProps,
        ...projectPathProps,
        ...featureFlagPathProps
      })}
      exact
    >
      <FeatureFlagsDetailPage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toCFSegmentDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...segmentPathProps
      })}
      exact
    >
      <SegmentDetailPage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toCFTargetDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...targetPathProps
      })}
      exact
    >
      <TargetDetailPage />
    </RouteWithLayout>

    <Route
      licenseRedirectData={licenseRedirectData}
      path={routes.toCFTargetManagement({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <RedirectToTargets />
    </Route>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toCFSegments({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <SegmentsPage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toCFTargets({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <TargetsPage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toCFEnvironments({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <EnvironmentsPage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toCFEnvironmentDetails({ ...accountPathProps, ...projectPathProps, ...environmentPathProps })}
      exact
    >
      <EnvironmentDetails />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toCFOnboarding({ ...accountPathProps, ...projectPathProps, ...environmentPathProps })}
      exact
    >
      <OnboardingPage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toCFOnboardingDetail({ ...accountPathProps, ...projectPathProps, ...environmentPathProps })}
      exact
    >
      <OnboardingDetailPage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toCFWorkflows({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <CFWorkflowsPage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      exact
      path={routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <PipelineDetails>
        <CFPipelineStudio />
      </PipelineDetails>
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toPipelines({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
    >
      <CFPipelineContainer>
        <PipelinesPage />
      </CFPipelineContainer>
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toDeployments({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
    >
      <CFPipelineContainer>
        <DeploymentsList />
      </CFPipelineContainer>
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      exact
      path={routes.toInputSetList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <PipelineDetails>
        <InputSetList />
      </PipelineDetails>
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toInputSetForm({ ...accountPathProps, ...inputSetFormPathProps, ...pipelineModuleParams })}
      exact
    >
      <EnhancedInputSetForm />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toTriggersPage({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
      exact
    >
      <PipelineDetails>
        <TriggersPage />
      </PipelineDetails>
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toTriggersDetailPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })}
      exact
    >
      <TriggersDetailPage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toTriggersWizardPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })}
    >
      <TriggerDetails>
        <TriggersWizardPage />
      </TriggerDetails>
    </RouteWithLayout>

    <Route
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toExecution({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
      exact
    >
      <RedirectToExecutionPipeline />
    </Route>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toExecutionPipelineView({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
      exact
    >
      <ExecutionLandingPage>
        <ExecutionPipelineView />
      </ExecutionLandingPage>
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toExecutionInputsView({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
      exact
    >
      <ExecutionLandingPage>
        <ExecutionInputsView />
      </ExecutionLandingPage>
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toExecutionArtifactsView({
        ...accountPathProps,
        ...executionPathProps,
        ...pipelineModuleParams
      })}
      exact
    >
      <ExecutionLandingPage>
        <ExecutionArtifactsView />
      </ExecutionLandingPage>
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toPipelineDetail({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
      exact
    >
      <RedirectToPipelineDetailHome />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toPipelineDeploymentList({
        ...accountPathProps,
        ...pipelinePathProps,
        ...pipelineModuleParams
      })}
      exact
    >
      <PipelineDetails>
        <CFPipelineDeploymentList />
      </PipelineDetails>
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toPipelineDetail({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
      exact
    >
      <RedirectToPipelineDetailHome />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      path={routes.toConnectors({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
      exact
    >
      <ConnectorsPage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toCreateConnectorFromYaml({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
      exact
    >
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toConnectorDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...connectorPathProps,
        ...cfModuleParams
      })}
      exact
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toSecrets({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
      exact
    >
      <SecretsPage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toCreateSecretFromYaml({
        ...accountPathProps,
        ...projectPathProps,
        ...pipelineModuleParams
      })}
      exact
    >
      <CreateSecretFromYamlPage />
    </RouteWithLayout>

    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toSecretDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...modulePathProps
      })}
      exact
    >
      <RedirectToSecretDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toSecretDetailsOverview({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...modulePathProps
      })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretDetails />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CFSideNavProps}
      path={routes.toSecretDetailsReferences({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...modulePathProps
      })}
      exact
    >
      <SecretDetailsHomePage>
        <SecretReferences />
      </SecretDetailsHomePage>
    </RouteWithLayout>

    <AdminRouteDestinations />
  </>
)
