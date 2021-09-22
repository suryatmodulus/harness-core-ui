import React from 'react'
import routes from '@common/RouteDefinitions'

import { accountPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'

import type { SidebarContext } from '@common/navigation/SidebarProvider'
import AccountSideNav from '@common/components/AccountSideNav/AccountSideNav'
import Policies from './pages/Policies/Policies'
import PolicyControlPage from './pages/PolicyControl/PolicyControlPage'

export const AccountSideNavProps: SidebarContext = {
  navComponent: AccountSideNav,
  icon: 'nav-settings',
  title: 'Account Settings'
}

export default (
  <>
    <RouteWithLayout path={routes.toPolicyListPage({ ...accountPathProps })} exact sidebarProps={AccountSideNavProps}>
      <PolicyControlPage>
        <Policies />
      </PolicyControlPage>
    </RouteWithLayout>
  </>
)
