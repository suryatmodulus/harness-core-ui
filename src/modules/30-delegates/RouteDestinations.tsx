import React from 'react'

import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, delegateConfigProps, delegatePathProps } from '@common/utils/routeUtils'
import DelegatesPage from '@delegates/pages/delegates/DelegatesPage'
import DelegateProfileDetails from '@delegates/pages/delegates/DelegateConfigurationDetailPage'
import DelegateDetails from '@delegates/pages/delegates/DelegateDetails'
import { HomeSideNavProps } from '@common/RouteDestinations'

export default (
  <>
    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={[routes.toDelegates({ ...accountPathProps }), routes.toDelegates({ ...accountPathProps, ...orgPathProps })]}
      exact
    >
      <DelegatesPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={[
        routes.toDelegatesDetails({ ...accountPathProps, ...delegatePathProps }),
        routes.toDelegatesDetails({ ...accountPathProps, ...delegatePathProps })
      ]}
    >
      <DelegateDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={[
        routes.toDelegateConfigsDetails({ ...accountPathProps, ...delegateConfigProps }),
        routes.toDelegateConfigsDetails({ ...accountPathProps, ...delegateConfigProps })
      ]}
    >
      <DelegateProfileDetails />
    </RouteWithLayout>
  </>
)
