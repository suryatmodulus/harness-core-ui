import React from 'react'

import routes from '@common/RouteDefinitions'

import { accountPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'

import { HomeSideNavProps } from '@common/RouteDestinations'
import HomePage from './pages/home/HomePage'
import DashboardViewPage from './pages/dashboardView/DashboardView'

const viewPathProps: { viewId: string } = {
  viewId: ':viewId'
}

export default (
  <>
    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toCustomDasboard({ ...accountPathProps })} exact>
      <HomePage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={routes.toViewCustomDashboard({ ...accountPathProps, ...viewPathProps })}
      exact
    >
      <DashboardViewPage />
    </RouteWithLayout>
  </>
)
