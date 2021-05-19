import React from 'react'

import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  orgPathProps,
  delegateConfigProps,
  delegatePathProps,
  projectPathProps
} from '@common/utils/routeUtils'
import AccountSettingsSideNav from '@common/navigation/AccountSettingsSideNav/AccountSettingsSideNav'
import DelegatesPage from '@delegates/pages/delegates/DelegatesPage'
import ResourcesPage from '@common/pages/resources/ResourcesPage'
import DelegateProfileDetails from '@delegates/pages/delegates/DelegateConfigurationDetailPage'
import DelegateDetails from '@delegates/pages/delegates/DelegateDetails'

const AccountSettingsSideNavProps: SidebarContext = {
  navComponent: AccountSettingsSideNav,
  subtitle: 'ACCOUNT',
  title: 'Settings',
  icon: 'nav-settings'
}

export default (
  <>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toResourcesDelegates({ ...accountPathProps }),
        routes.toResourcesDelegates({ ...orgPathProps }),
        routes.toResourcesDelegates({ ...projectPathProps })
      ]}
      exact
    >
      <ResourcesPage>
        <DelegatesPage />
      </ResourcesPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toResourcesDelegatesDetails({ ...accountPathProps, ...delegatePathProps }),
        routes.toResourcesDelegatesDetails({ ...orgPathProps, ...delegatePathProps }),
        routes.toResourcesDelegatesDetails({ ...projectPathProps, ...delegatePathProps })
      ]}
    >
      <DelegateDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toResourcesDelegateConfigsDetails({ ...accountPathProps, ...delegateConfigProps }),
        routes.toResourcesDelegateConfigsDetails({ ...orgPathProps, ...delegateConfigProps }),
        routes.toResourcesDelegateConfigsDetails({
          ...projectPathProps,
          ...delegateConfigProps
        })
      ]}
    >
      <DelegateProfileDetails />
    </RouteWithLayout>
  </>
)
