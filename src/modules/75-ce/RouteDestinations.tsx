import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'

import routes from '@common/RouteDefinitions'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { MinimalLayout } from '@common/layouts'

import CESideNav from '@ce/components/CESideNav/CESideNav'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import CEHomePage from './pages/home/CEHomePage'
import CEDashboardPage from './pages/dashboard/CEDashboardPage'
import CECODashboardPage from './pages/co-dashboard/CECODashboardPage'
import CECOCreateGatewayPage from './pages/co-create-gateway/CECOCreateGatewayPage'
import CECOEditGatewayPage from './pages/co-edit-gateway/CECOEditGatewayPage'
import CECOLoadBalancersPage from './pages/co-access-points/CECOAccessPointsPage'
import Budgets from './pages/budgets/Budgets'
import CETrialHomePage from './pages/home/CETrialHomePage'

import RecommendationList from './pages/recommendationList/RecommendationList'
import RecommendationDetailsPage from './pages/recommendationDetails/RecommendationDetailsPage'

const RedirectToCEHome = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()

  return <Redirect to={routes.toCEHome(params)} />
}
const RedirectToCEProject = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject?.modules?.includes(ModuleName.CD)) {
    return <Redirect to={routes.toCECODashboard(params)} />
  } else {
    return <Redirect to={routes.toCDHome(params)} />
  }
}

const CESideNavProps: SidebarContext = {
  navComponent: CESideNav,
  subtitle: 'CONTINUOUS',
  title: 'Efficiency',
  icon: 'ce-main'
}

export default (
  <>
    <Route path={routes.toCE({ ...accountPathProps })} exact>
      <RedirectToCEHome />
    </Route>
    <Route path={routes.toCDProject({ ...accountPathProps, ...projectPathProps })} exact>
      <RedirectToCEProject />
    </Route>
    <RouteWithLayout sidebarProps={CESideNavProps} path={routes.toCEHome({ ...accountPathProps })} exact>
      <CEHomePage />
    </RouteWithLayout>
    <RouteWithLayout
      layout={MinimalLayout}
      path={routes.toModuleTrialHome({ ...accountPathProps, module: 'ce' })}
      exact
    >
      <CETrialHomePage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CESideNavProps}
      path={routes.toCEDashboard({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <CEDashboardPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CESideNavProps}
      path={routes.toCECODashboard({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <CEHomePage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CESideNavProps}
      path={routes.toCECORules({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <CECODashboardPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CESideNavProps}
      path={routes.toCECOCreateGateway({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <CECOCreateGatewayPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CESideNavProps}
      path={routes.toCECOEditGateway({
        ...accountPathProps,
        ...projectPathProps,
        gatewayIdentifier: ':gatewayIdentifier'
      })}
      exact
    >
      <CECOEditGatewayPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CESideNavProps}
      path={routes.toCECOAccessPoints({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <CECOLoadBalancersPage />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={CESideNavProps} path={routes.toCEBudgets({ ...accountPathProps })} exact>
      <Budgets />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={CESideNavProps}
      path={routes.toCERecommendations({ ...accountPathProps, ...projectPathProps })}
      exact
    >
      <RecommendationList />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={CESideNavProps}
      path={routes.toCERecommendationDetails({
        ...accountPathProps,
        ...projectPathProps,
        recommendation: ':recommendation'
      })}
      exact
    >
      <RecommendationDetailsPage />
    </RouteWithLayout>
  </>
)
