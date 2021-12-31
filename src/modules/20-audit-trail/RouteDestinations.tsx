import React from 'react'
import { RouteWithLayout } from '@common/router'
import { AccountSideNavProps } from '@common/RouteDestinations'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import AuditTrailsPage from './pages/AuditTrails/AuditTrailsPage'

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toAuditTrail({ ...accountPathProps })} exact>
      <AuditTrailsPage />
    </RouteWithLayout>
  </>
)
