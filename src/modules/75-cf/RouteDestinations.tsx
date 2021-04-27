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
  ModulePathParams,
  PipelinePathProps,
  PipelineType,
  ProjectPathProps
} from '@common/interfaces/RouteInterfaces'
import { MinimalLayout } from '@common/layouts'

import CFHomePage from '@cf/pages/home/CFHomePage'
import FeatureFlagsPage from '@cf/pages/feature-flags/FeatureFlagsPage'
import FeatureFlagsDetailPage from '@cf/pages/feature-flags-detail/FeatureFlagsDetailPage'
import EnvironmentsPage from '@cf/pages/environments/EnvironmentsPage'
import EnvironmentDetails from '@cf/pages/environment-details/EnvironmentDetails'
import CFWorkflowsPage from '@cf/pages/workflows/CFWorkflowsPage'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import SideNav from '@cf/components/SideNav/SideNav'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
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
import RunPipelinePage from '@pipeline/pages/RunPipeline/RunPipelinePage'
import ExecutionLandingPage from '@pipeline/pages/execution/ExecutionLandingPage/ExecutionLandingPage'
import ExecutionPipelineView from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionPipelineView'
import ExecutionInputsView from '@pipeline/pages/execution/ExecutionInputsView/ExecutionInputsView'
import ExecutionArtifactsView from '@pipeline/pages/execution/ExecutionArtifactsView/ExecutionArtifactsView'
import { TargetsPage } from './pages/targets/TargetsPage'
import CFPipelineStudio from './pages/pipeline-studio/CFPipelineStudio'
import { TargetDetailPage } from './pages/target-details/TargetDetailPage'
import { SegmentsPage } from './pages/segments/SegmentsPage'
import { SegmentDetailPage } from './pages/segment-details/SegmentDetailPage'
import { OnboardingPage } from './pages/onboarding/OnboardingPage'
import { OnboardingDetailPage } from './pages/onboarding/OnboardingDetailPage'

import './components/PipelineStudio/FeatureFlagStage'
import CFTrialHomePage from './pages/home/CFTrialHomePage'

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

const RedirectToResourcesHome = (): React.ReactElement => {
  const params = useParams<ProjectPathProps & ModulePathParams>()

  return <Redirect to={routes.toResourcesConnectors(params)} />
}

const RedirectToExecutionPipeline = (): React.ReactElement => {
  const params = useParams<PipelineType<ExecutionPathProps>>()

  return <Redirect to={routes.toExecutionPipelineView(params)} />
}

const RedirectToPipelineDetailHome = (): React.ReactElement => {
  const params = useParams<PipelineType<PipelinePathProps>>()

  return <Redirect to={routes.toPipelineStudio(params)} />
}

const CFSideNavProps: SidebarContext = {
  navComponent: SideNav,
  subtitle: 'CONTINUOUS',
  title: 'Features',
  icon: 'cf-main'
}

export default (
  <>
    <Route path={routes.toCF({ ...accountPathProps })} exact>
      <RedirectToCFHome />
    </Route>

    <Route path={routes.toCFProject({ ...accountPathProps, ...projectPathProps })} exact>
      <RedirectToCFProject />
    </Route>

    <RouteWithLayout
      layout={MinimalLayout}
      path={routes.toModuleTrialHome({ ...accountPathProps, module: 'cf' })}
      exact
    >
      <CFTrialHomePage />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={CFSideNavProps} path={routes.toCFHome({ ...accountPathProps })} exact>
      <CFHomePage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toCFFeatureFlags({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <FeatureFlagsPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toCFFeatureFlagsDetail({
        ...accountPathProps,
        ...projectPathProps,
        ...featureFlagPathProps,
        ...environmentPathProps
      })}
      exact
    >
      <FeatureFlagsDetailPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toCFSegmentDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...segmentPathProps,
        ...environmentPathProps
      })}
      exact
    >
      <SegmentDetailPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toCFTargetDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...targetPathProps,
        ...environmentPathProps
      })}
      exact
    >
      <TargetDetailPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toCFSegments({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <SegmentsPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toCFTargets({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <TargetsPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toCFEnvironments({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <EnvironmentsPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toCFEnvironmentDetails({ ...accountPathProps, ...projectPathProps, ...environmentPathProps })}
      exact
    >
      <EnvironmentDetails />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toCFOnboarding({ ...accountPathProps, ...projectPathProps, ...environmentPathProps })}
      exact
    >
      <OnboardingPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toCFOnboardingDetail({ ...accountPathProps, ...projectPathProps, ...environmentPathProps })}
      exact
    >
      <OnboardingDetailPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toCFWorkflows({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <CFWorkflowsPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      exact
      path={routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <PipelineDetails>
        <CFPipelineStudio />
      </PipelineDetails>
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toPipelines({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
    >
      <PipelinesPage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toInputSetList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <PipelineDetails>
        <InputSetList />
      </PipelineDetails>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toDeployments({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })}
      exact
    >
      {/*<DeploymentsList />*/}
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toInputSetForm({ ...accountPathProps, ...inputSetFormPathProps, ...pipelineModuleParams })}
    >
      <EnhancedInputSetForm />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toTriggersPage({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <PipelineDetails>
        <TriggersPage />
      </PipelineDetails>
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toTriggersDetailPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })}
    >
      <TriggersDetailPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CFSideNavProps}
      path={routes.toTriggersWizardPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })}
    >
      <TriggerDetails>
        <TriggersWizardPage />
      </TriggerDetails>
    </RouteWithLayout>

    <Route
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toExecution({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
    >
      <RedirectToExecutionPipeline />
    </Route>

    <RouteWithLayout
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toRunPipeline({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <RunPipelinePage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toExecutionPipelineView({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
    >
      <ExecutionLandingPage>
        <ExecutionPipelineView />
      </ExecutionLandingPage>
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toExecutionInputsView({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })}
    >
      <ExecutionLandingPage>
        <ExecutionInputsView />
      </ExecutionLandingPage>
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CFSideNavProps}
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
      sidebarProps={CFSideNavProps}
      path={routes.toPipelineDetail({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <RedirectToPipelineDetailHome />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toPipelineDeploymentList({
        ...accountPathProps,
        ...pipelinePathProps,
        ...pipelineModuleParams
      })}
    >
      <PipelineDetails>{/*<CFPipelineDeploymentList />*/}</PipelineDetails>
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toPipelineDetail({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
    >
      <RedirectToPipelineDetailHome />
    </RouteWithLayout>

    <Route
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toResources({ ...accountPathProps, ...projectPathProps, ...modulePathProps })}
    >
      <RedirectToResourcesHome />
    </Route>

    <RouteWithLayout
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toCFAdminResourcesConnectorDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...connectorPathProps
      })}
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CFSideNavProps}
      path={routes.toResourcesSecretDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps
      })}
    >
      <SecretDetails />
    </RouteWithLayout>
  </>
)
