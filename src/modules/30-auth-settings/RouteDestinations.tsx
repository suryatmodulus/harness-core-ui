import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'

import Configuration from '@auth-settings/pages/Configuration/Configuration'
import AccountOverview from '@auth-settings/pages/AccountOverview/AccountOverview'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'

import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String } from 'framework/strings'
import { HomeSideNavProps } from '@common/RouteDestinations'

RbacFactory.registerResourceTypeHandler(ResourceType.ACCOUNT, {
  icon: 'nav-settings',
  label: 'rbac.accountSettings.label',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_ACCOUNT]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_ACCOUNT]: <String stringID="edit" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.AUTHSETTING, {
  icon: 'nav-settings',
  label: 'authSettings.authenticationSettings',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_AUTHSETTING]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_AUTHSETTING]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_AUTHSETTING]: <String stringID="rbac.permissionLabels.delete" />
  }
})

const RedirectToConfiguration = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()
  return <Redirect to={routes.toAccountConfiguration(params)} />
}

export default (
  <>
    <Route sidebarProps={HomeSideNavProps} path={routes.toAuthenticationSettings({ ...accountPathProps })} exact>
      <RedirectToConfiguration />
    </Route>
    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={routes.toAccountConfiguration({ ...accountPathProps })}
      exact
    >
      <Configuration />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toSetup({ ...accountPathProps })} exact>
      <AccountOverview />
    </RouteWithLayout>
  </>
)
