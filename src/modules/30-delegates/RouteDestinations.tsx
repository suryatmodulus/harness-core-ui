import React from 'react'

import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, delegateConfigProps, delegatePathProps } from '@common/utils/routeUtils'
import DelegatesPage from '@delegates/pages/delegates/DelegatesPage'
import ResourcesPage from '@common/pages/resources/ResourcesPage'
import DelegateProfileDetails from '@delegates/pages/delegates/DelegateConfigurationDetailPage'
import DelegateDetails from '@delegates/pages/delegates/DelegateDetails'
import HomeSideNav from '@common/components/HomeSideNav/HomeSideNav'

const HomeSideNavProps: SidebarContext = {
  navComponent: HomeSideNav,
  icon: 'harness'
}

export default (
  <>
    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={[
        routes.toResourcesDelegates({ ...accountPathProps }),
        routes.toOrgResourcesDelegates({ ...accountPathProps, ...orgPathProps })
      ]}
      exact
    >
      <ResourcesPage>
        <DelegatesPage />
      </ResourcesPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={[
        routes.toResourcesDelegatesDetails({ ...accountPathProps, ...delegatePathProps }),
        routes.toResourcesDelegatesDetails({ ...accountPathProps, ...delegatePathProps })
      ]}
    >
      <DelegateDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={[
        routes.toResourcesDelegateConfigsDetails({ ...accountPathProps, ...delegateConfigProps }),
        routes.toResourcesDelegateConfigsDetails({ ...accountPathProps, ...delegateConfigProps })
      ]}
    >
      <DelegateProfileDetails />
    </RouteWithLayout>
  </>
)
