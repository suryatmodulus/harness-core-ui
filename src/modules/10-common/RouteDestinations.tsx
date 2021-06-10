import React from 'react'
import { Route, Redirect, useParams } from 'react-router-dom'

import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, withAccountId } from '@common/utils/routeUtils'

import AccountOverview from '@common/pages/AccountOverview/AccountOverview'
import GovernancePage from '@common/pages/governance/GovernancePage'
import type { SidebarContext } from './navigation/SidebarProvider'
import type { AccountPathProps } from './interfaces/RouteInterfaces'
import GenericErrorPage from './pages/GenericError/GenericErrorPage'
import { PurposePage } from './pages/purpose/PurposePage'
import HomeSideNav from './components/HomeSideNav/HomeSideNav'
import SubscriptionsPage from './pages/subscriptions/SubscriptionsPage'

const RedirectToHome = (): React.ReactElement => {
  const { accountId } = useParams<AccountPathProps>()
  return <Redirect to={routes.toGetStarted({ accountId })} />
}

export const HomeSideNavProps: SidebarContext = {
  navComponent: HomeSideNav,
  icon: 'harness',
  title: 'Home'
}

const justAccountPath = withAccountId(() => '/')

export default (
  <>
    <Route exact path={[justAccountPath({ ...accountPathProps }), routes.toHome({ ...accountPathProps })]}>
      <RedirectToHome />
    </Route>
    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toSetup({ ...accountPathProps })} exact>
      <AccountOverview />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={[
        routes.toGovernance({ ...accountPathProps }),
        routes.toGovernance({ ...accountPathProps, ...orgPathProps })
      ]}
      exact
    >
      <GovernancePage />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toSubscriptions({ ...accountPathProps })} exact>
      <SubscriptionsPage />
    </RouteWithLayout>
    <Route path={routes.toGenericError({ ...accountPathProps })}>
      <GenericErrorPage />
    </Route>
    <Route path={routes.toPurpose({ ...accountPathProps })} exact>
      <PurposePage />
    </Route>
  </>
)
