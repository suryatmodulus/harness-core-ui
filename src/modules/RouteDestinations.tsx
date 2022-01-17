/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Switch, Route } from 'react-router-dom'
import auditTrailRoutes from '@audit-trail/RouteDestinations'
import delegatesRoutes from '@delegates/RouteDestinations'
import commonRoutes from '@common/RouteDestinations'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import AuthSettingsRoutes from '@auth-settings/RouteDestinations'
import secretsRoutes from '@secrets/RouteDestinations'
import rbacRoutes from '@rbac/RouteDestinations'
import projectsOrgsRoutes from '@projects-orgs/RouteDestinations'
import connectorRoutes from '@connectors/RouteDestinations'
import tempatesRoutes from '@templates-library/RouteDestinations'
import userProfileRoutes from '@user-profile/RouteDestinations'
import '@pipeline/RouteDestinations'
import CDRoutes from '@cd/RouteDestinations'
import CIRoutes from '@ci/RouteDestinations'
import CVRoutes from '@cv/RouteDestinations'
import CFRoutes from '@cf/RouteDestinations'
import CERoutes from '@ce/RouteDestinations'
import GovernanceRoutes from '@governance/RouteDestinations'
import DASHBOARDRoutes from '@dashboards/RouteDestinations'
import AccountSideNav from '@common/components/AccountSideNav/AccountSideNav'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import { String } from 'framework/strings'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { PermissionIdentifier } from 'microfrontends'

export const AccountSideNavProps: SidebarContext = {
  navComponent: AccountSideNav,
  icon: 'nav-settings',
  title: 'Account Settings'
}

RbacFactory.registerResourceCategory(ResourceCategory.CHANGEINTELLIGENCE_FUNCTION, {
  icon: 'nav-cv',
  label: 'common.changeIntelligence'
})

RbacFactory.registerResourceTypeHandler(ResourceType.MONITOREDSERVICE, {
  icon: 'nav-cv',
  label: 'cv.monitoredServices.title',
  category: ResourceCategory.CHANGEINTELLIGENCE_FUNCTION,
  permissionLabels: {
    [PermissionIdentifier.VIEW_MONITORED_SERVICE]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_MONITORED_SERVICE]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_MONITORED_SERVICE]: <String stringID="delete" />,
    [PermissionIdentifier.TOGGLE_MONITORED_SERVICE]: <String stringID="cf.rbac.featureflag.toggle" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.SLO, {
  icon: 'nav-cv',
  label: 'cv.SLO',
  category: ResourceCategory.CHANGEINTELLIGENCE_FUNCTION,
  permissionLabels: {
    [PermissionIdentifier.VIEW_SLO_SERVICE]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_SLO_SERVICE]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_SLO_SERVICE]: <String stringID="delete" />
  }
})

export default function RouteDestinations(): React.ReactElement {
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED } = useFeatureFlags()

  return (
    <Switch>
      {...commonRoutes.props.children}
      {...secretsRoutes.props.children}
      {...auditTrailRoutes.props.children}
      {...rbacRoutes.props.children}
      {...delegatesRoutes.props.children}
      {...projectsOrgsRoutes.props.children}
      {...DASHBOARDRoutes.props.children}
      {...GovernanceRoutes.props.children}
      {...connectorRoutes.props.children}
      {...tempatesRoutes.props.children}
      {...userProfileRoutes.props.children}
      {...CING_ENABLED ? CIRoutes.props.children : []}
      {...CDNG_ENABLED ? CDRoutes.props.children : []}
      {...CVNG_ENABLED ? CVRoutes.props.children : []}
      <Route path="/account/:accountId/settings">
        <AuthSettingsRoutes />
      </Route>
      {CENG_ENABLED ? (
        <Route path="/account/:accountId/:module(ce)">
          <CERoutes />
        </Route>
      ) : null}
      {CFNG_ENABLED && <CFRoutes />}
      <Route path="*">
        <NotFoundPage />
      </Route>
    </Switch>
  )
}
