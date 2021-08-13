import React from 'react'
import { Route, Redirect, useParams } from 'react-router-dom'

import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, withAccountId } from '@common/utils/routeUtils'

import GovernancePage from '@common/pages/governance/GovernancePage'
import type { SidebarContext } from './navigation/SidebarProvider'
import type { AccountPathProps } from './interfaces/RouteInterfaces'
import GenericErrorPage from './pages/GenericError/GenericErrorPage'
import WelcomePage from './pages/welcome/WelcomePage'
import HomeSideNav from './components/HomeSideNav/HomeSideNav'
import AccountSideNav from './components/AccountSideNav/AccountSideNav'
import AccountResources from './pages/AccountResources/AccountResources'

const RedirectToHome = (): React.ReactElement => {
  const { accountId } = useParams<AccountPathProps>()
  return <Redirect to={routes.toGetStarted({ accountId })} />
}

export const HomeSideNavProps: SidebarContext = {
  navComponent: HomeSideNav,
  icon: 'harness',
  title: 'Home'
}

export const AccountSideNavProps: SidebarContext = {
  navComponent: AccountSideNav,
  icon: 'nav-settings',
  title: 'Account Settings'
}

const justAccountPath = withAccountId(() => '/')

export default (
  <>
    <Route exact path={[justAccountPath({ ...accountPathProps }), routes.toHome({ ...accountPathProps })]}>
      <RedirectToHome />
    </Route>

    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toAccountResources({ ...accountPathProps })} exact>
      <AccountResources />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={[
        routes.toGovernance({ ...accountPathProps }),
        routes.toGovernance({ ...accountPathProps, ...orgPathProps })
      ]}
      exact
    >
      <GovernancePage />
    </RouteWithLayout>
    <Route path={routes.toGenericError({ ...accountPathProps })}>
      <GenericErrorPage />
    </Route>
    <Route path={routes.toPurpose({ ...accountPathProps })} exact>
      <WelcomePage />
    </Route>
  </>
)
