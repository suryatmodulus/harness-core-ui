import React from 'react'
import { RouteWithLayout } from '@common/router'
import { AccountSideNavProps } from '@common/RouteDestinations'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import AuditTrailsPage from './pages/AuditTrails/AuditTrailsPage'
import AuditTrailFactory from './factories/AuditTrailFactory'

// change the icon - Yuen
AuditTrailFactory.registerHandler('CORE', { icon: { iconName: 'settings', size: 30 } })

export default (
  <>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toAccountAuditTrail({ ...accountPathProps })}
      exact
    >
      <AuditTrailsPage />
    </RouteWithLayout>
  </>
)
