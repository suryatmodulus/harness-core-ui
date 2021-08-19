import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'

import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { MinimalLayout } from '@common/layouts'

import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import DashboardResourceModalBody from '@dashboards/components/DashboardResourceModalBody/DashbaordResourceModalBody'
import DashboardResourceRenderer from '@dashboards/components/DashboardResourceRenderer/DashboardResourceRenderer'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String } from 'framework/strings'
import { HomeSideNavProps } from '@common/RouteDestinations'

import LandingDashboardPage from '@dashboards/pages/LandingDashboardPage/LandingDashboardPage'
import { ModuleName } from 'framework/types/ModuleName'
import HomePage from './pages/home/HomePage'
import FoldersPage from './pages/folders/FoldersPage'
import DashboardViewPage from './pages/dashboardView/DashboardView'
import LandingDashboardFactory from './factories/LandingDashboardFactory'
import LandingDashboardSummaryWidget from './components/LandingDashboardSummaryWidget/LandingDashboardSummaryWidget'

const RedirectToHome = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()

  return <Redirect to={routes.toCustomDashboardHome(params)} />
}

const viewPathProps: { viewId: string; folderId: string } = {
  viewId: ':viewId',
  folderId: ':folderId'
}

RbacFactory.registerResourceTypeHandler(ResourceType.DASHBOARDS, {
  icon: 'support-account',
  label: 'common.dashboards',
  labelOverride: 'dashboards.homePage.folders',
  category: ResourceCategory.SHARED_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.VIEW_DASHBOARD]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_DASHBOARD]: <String stringID="rbac.permissionLabels.manage" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <DashboardResourceModalBody {...props} />,
  // eslint-disable-next-line react/display-name
  staticResourceRenderer: props => <DashboardResourceRenderer {...props} />
})

LandingDashboardFactory.registerModuleDashboardHandler(ModuleName.COMMON, {
  label: 'dashboards.landingDashboard.atAGlance',
  // eslint-disable-next-line react/display-name
  moduleDashboardRenderer: () => <LandingDashboardSummaryWidget />
})

export default (
  <>
    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toLandingDashboard({ ...accountPathProps })} exact>
      <LandingDashboardPage />
    </RouteWithLayout>

    <Route path={routes.toCustomDashboard({ ...accountPathProps })} exact>
      <RedirectToHome />
    </Route>
    <RouteWithLayout
      layout={MinimalLayout}
      exact
      path={routes.toCustomDashboardHome({ ...accountPathProps, folderId: ':folderId' })}
    >
      <HomePage />
    </RouteWithLayout>
    <RouteWithLayout layout={MinimalLayout} path={routes.toCustomFolderHome({ ...accountPathProps })} exact>
      <FoldersPage />
    </RouteWithLayout>
    <RouteWithLayout
      layout={MinimalLayout}
      path={routes.toViewCustomDashboard({ ...accountPathProps, ...viewPathProps })}
      exact
    >
      <DashboardViewPage />
    </RouteWithLayout>
  </>
)
