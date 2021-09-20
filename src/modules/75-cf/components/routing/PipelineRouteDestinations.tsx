import React, { FC, useEffect } from 'react'
import { Redirect, Route, useParams } from 'react-router-dom'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { registerFeatureFlagPipelineStage } from '@cf/pages/pipeline-studio/views/FeatureFlagStage'
import { registerFlagConfigurationPipelineStep } from '@cf/components/PipelineSteps'
import { RouteWithLayout } from '@common/router'
import { CFSideNavProps } from '@cf/constants'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  executionPathProps,
  inputSetFormPathProps,
  pipelineModuleParams,
  pipelinePathProps,
  projectPathProps,
  triggerPathProps
} from '@common/utils/routeUtils'
import type { ExecutionPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import PipelineDetails from '@pipeline/pages/pipeline-details/PipelineDetails'
import CFPipelineStudio from '@cf/pages/pipeline-studio/CFPipelineStudio'
import { CFPipelineContainer } from '@cf/pages/pipeline-studio/CFPipelineContainer'
import PipelinesPage from '@pipeline/pages/pipelines/PipelinesPage'
import DeploymentsList from '@pipeline/pages/deployments-list/DeploymentsList'
import InputSetList from '@pipeline/pages/inputSet-list/InputSetList'
import { EnhancedInputSetForm } from '@pipeline/components/InputSetForm/InputSetForm'
import TriggersPage from '@pipeline/pages/triggers/TriggersPage'
import TriggersDetailPage from '@pipeline/pages/triggers/TriggersDetailPage'
import TriggerDetails from '@pipeline/pages/trigger-details/TriggerDetails'
import TriggersWizardPage from '@pipeline/pages/triggers/TriggersWizardPage'
import ExecutionLandingPage from '@pipeline/pages/execution/ExecutionLandingPage/ExecutionLandingPage'
import ExecutionPipelineView from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionPipelineView'
import ExecutionInputsView from '@pipeline/pages/execution/ExecutionInputsView/ExecutionInputsView'
import ExecutionArtifactsView from '@pipeline/pages/execution/ExecutionArtifactsView/ExecutionArtifactsView'
import CFPipelineDeploymentList from '@cf/pages/pipeline-deployment-list/CFPipelineDeploymentList'
import { licenseRedirectData } from '@cf/components/routing/License'

const RedirectToExecutionPipeline = (): React.ReactElement => {
  const params = useParams<PipelineType<ExecutionPathProps>>()

  return <Redirect to={routes.toExecutionPipelineView(params)} />
}

const RedirectToPipelineDetailHome = (): React.ReactElement => {
  const params = useParams<PipelineType<PipelinePathProps>>()

  return <Redirect to={routes.toPipelineStudio(params)} />
}

const PipelineRouteDestinations: FC = () => {
  const pipelineEnabled = useFeatureFlag(FeatureFlag.FF_PIPELINE)

  useEffect(() => {
    if (pipelineEnabled) {
      registerFeatureFlagPipelineStage()
      registerFlagConfigurationPipelineStep()
    }
  }, [pipelineEnabled])

  if (!pipelineEnabled) {
    return null
  }

  return (
    <>
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
        path={routes.toExecutionPipelineView({
          ...accountPathProps,
          ...executionPathProps,
          ...pipelineModuleParams
        })}
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
    </>
  )
}

export default PipelineRouteDestinations
