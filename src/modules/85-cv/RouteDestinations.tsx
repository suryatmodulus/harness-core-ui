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
  verificationPathProps
} from '@common/utils/routeUtils'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import CVDashboardPage from '@cv/pages/dashboard/CVDashboardPage'
import DeploymentDrilldownView from '@cv/pages/dashboard/deployment-drilldown/DeploymentDrilldownView'
import ActivityChangesDrilldownView from '@cv/pages/dashboard/activity-changes-drilldown/ActivityChangesDrilldownView'
import CVServicesPage from '@cv/pages/services/CVServicesPage'
import ActivitySourceSetup from '@cv/pages/onboarding/activity-source-setup/ActivitySourceSetup'
import ActivityDashBoardPage from '@cv/pages/activities/dashboard/ActivityDashBoardPage'
import CVGeneralSettingsPage from '@cv/pages/admin/general-settings/CVGeneralSettingsPage'
import CVGovernancePage from '@cv/pages/admin/governance/CVGovernancePage'
import CVSetupPage from '@cv/pages/admin/setup/CVSetupPage'
import MonitoringSource from '@cv/pages/monitoring-source/MonitoringSource'
import CVAccessControlPage from '@cv/pages/admin/access-control/CVAccessControlPage'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import SideNav from '@cv/components/SideNav/SideNav'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import CVActivitySourcesPage from '@cv/pages/admin/activity-sources/CVActivitySourcesPage'
import ResourcesPage from '@cv/pages/Resources/ResourcesPage'
import { useAppStore, ModuleName } from 'framework/exports'
import CVNotificationPage from './pages/admin/notifications/CVNotificationPage'
import CVMonitoringSourcesPage from './pages/admin/monitoring-sources/CVMonitoringSourcesPage'
import CVVerificationJobsPage from './pages/admin/verification-jobs/CVVerificationJobsPage'
import VerificationJobs from './pages/verification-jobs/VerificationJobsSetup'

const RedirectToCVHome = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()

  return <Redirect to={routes.toCVHome(params)} />
}

const RedirectToCVProject = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject?.modules?.includes(ModuleName.CV)) {
    return <Redirect to={routes.toCVProjectOverview(params)} />
  } else {
    return <Redirect to={routes.toCVHome(params)} />
  }
}

const RedirectToResourcesHome = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  return <Redirect to={routes.toCVAdminResourcesConnectors(params)} />
}

const CVSideNavProps: SidebarContext = {
  navComponent: SideNav,
  subtitle: 'CONTINUOUS',
  title: 'Verification',
  icon: 'cv-main'
}

export default (
  <>
    <Route path={routes.toCV({ ...accountPathProps })} exact>
      <RedirectToCVHome />
    </Route>

    <RouteWithLayout exact sidebarProps={CVSideNavProps} path={routes.toCVHome({ ...accountPathProps })}>
      <CVHomePage />
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
      path={routes.toCVAdminGeneralSettings({ ...accountPathProps, ...projectPathProps })}
    >
      <CVGeneralSettingsPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVAdminGovernance({ ...accountPathProps, ...projectPathProps })}
    >
      <CVGovernancePage />
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
    <Route
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVAdminResources({ ...accountPathProps, ...projectPathProps })}
    >
      <RedirectToResourcesHome />
    </Route>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVAdminResourcesConnectors({ ...accountPathProps, ...projectPathProps })}
    >
      <ResourcesPage>
        <ConnectorsPage />
      </ResourcesPage>
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVAdminResourcesSecretsListing({ ...accountPathProps, ...projectPathProps })}
    >
      <ResourcesPage>
        <SecretsPage />
      </ResourcesPage>
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVAdminResourcesConnectorDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...connectorPathProps
      })}
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVAdminResourcesSecretDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps
      })}
    >
      <SecretDetails />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={CVSideNavProps}
      path={routes.toCVAdminAccessControl({ ...accountPathProps, ...projectPathProps })}
    >
      <CVAccessControlPage />
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
  </>
)
