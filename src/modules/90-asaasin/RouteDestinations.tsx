import React from 'react'

import routes from '@common/RouteDefinitions'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { accountPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'

import AsaasinSideNav from '@asaasin/components/sideNav'
import AsaasinHomePage from './pages/home/AsaasinHomePage'
import AsaasinDashboardPage from './pages/AsaasinDashboard'
import AsaasinGitHubDashboardPage from './pages/github/dashboard'
import AsaasinPagerDutyDashboard from './pages/pagerduty/dashboard'
import AsaasinAtlassianDashboard from './pages/atlassian/dashboard'

const CESideNavProps: SidebarContext = {
  navComponent: AsaasinSideNav,
  subtitle: '',
  title: 'aSaaSin',
  icon: 'ce-main'
}

export default (
  <>
    <RouteWithLayout sidebarProps={CESideNavProps} path={routes.toAsaasin({ ...accountPathProps })} exact>
      <AsaasinHomePage />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={CESideNavProps} path={routes.toAsaasinDashboard({ ...accountPathProps })} exact>
      <AsaasinDashboardPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CESideNavProps}
      path={routes.toAsaasinGithubDashboard({ ...accountPathProps })}
      exact
    >
      <AsaasinGitHubDashboardPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CESideNavProps}
      path={routes.toAsaasinPagerDutyDashboard({ ...accountPathProps })}
      exact
    >
      <AsaasinPagerDutyDashboard />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CESideNavProps}
      path={routes.toAsaasinAtlassianDashboard({ ...accountPathProps })}
      exact
    >
      <AsaasinAtlassianDashboard />
    </RouteWithLayout>
  </>
)
