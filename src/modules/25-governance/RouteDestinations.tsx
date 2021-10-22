import React from 'react'
import routes from '@common/RouteDefinitions'

import { accountPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'

import type { SidebarContext } from '@common/navigation/SidebarProvider'
import AccountSideNav from '@common/components/AccountSideNav/AccountSideNav'
import Policies from './pages/Policies/Policies'
import PolicyControlPage from './pages/PolicyControl/PolicyControlPage'
import PolicySets from './pages/PolicySets/PolicySets'
import PolicyEvaluations from './pages/PolicyEvaluations/PolicyEvaluations'
import { EditPolicy } from './pages/EditPolicy/EditPolicy'
import PolicyDashboard from './pages/PolicyDashboard/PolicyDashboard'

export const AccountSideNavProps: SidebarContext = {
  navComponent: AccountSideNav,
  icon: 'nav-settings',
  title: 'Account Settings'
}

export default (
  <>
    <RouteWithLayout
      path={routes.toPolicyDashboardPage({ ...accountPathProps })}
      exact
      sidebarProps={AccountSideNavProps}
    >
      <PolicyControlPage title="Overview">
        <PolicyDashboard />
      </PolicyControlPage>
    </RouteWithLayout>

    <RouteWithLayout path={routes.toPolicyListPage({ ...accountPathProps })} exact sidebarProps={AccountSideNavProps}>
      <PolicyControlPage title="Policies">
        <Policies />
      </PolicyControlPage>
    </RouteWithLayout>

    <RouteWithLayout path={routes.toPolicyNewPage({ ...accountPathProps })} exact sidebarProps={AccountSideNavProps}>
      <PolicyControlPage title="New Policy">
        <EditPolicy />
      </PolicyControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      path={routes.toPolicyEditPage({ ...accountPathProps, policyIdentifier: ':policyIdentifier' })}
      exact
      sidebarProps={AccountSideNavProps}
    >
      <PolicyControlPage title="Edit Policy">
        <EditPolicy />
      </PolicyControlPage>
    </RouteWithLayout>

    <RouteWithLayout path={routes.toPolicySetsPage({ ...accountPathProps })} exact sidebarProps={AccountSideNavProps}>
      <PolicyControlPage title="Policy Sets">
        <PolicySets />
      </PolicyControlPage>
    </RouteWithLayout>

    <RouteWithLayout
      path={routes.toPolicyEvaluationsPage({ ...accountPathProps })}
      exact
      sidebarProps={AccountSideNavProps}
    >
      <PolicyControlPage title="Evaluations">
        <PolicyEvaluations />
      </PolicyControlPage>
    </RouteWithLayout>
  </>
)
