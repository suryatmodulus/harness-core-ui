import React from 'react'

import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, delegateConfigProps, delegatePathProps } from '@common/utils/routeUtils'

import RbacFactory from '@rbac/factories/RbacFactory'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import { String } from 'framework/strings'

import DelegatesPage from '@delegates/pages/delegates/DelegatesPage'
import DelegateProfileDetails from '@delegates/pages/delegates/DelegateConfigurationDetailPage'
import DelegateDetails from '@delegates/pages/delegates/DelegateDetails'

import DelegateResourceModalBody from '@delegates/components/DelegateResourceModalBody/DelegateResourceModalBody'
import DelegateConfigurationResourceModalBody from '@delegates/components/DelegateConfigurationResourceModalBody/DelegateConfigurationResourceModalBody'
import DelegateConfigurationResourceRenderer from '@delegates/components/DelegateConfigurationResourceRenderer/DelegateConfigurationResourceRenderer'
import DelegateResourceRenderer from '@delegates/components/DelegateResourceRenderer/DelegateResourceRenderer'

import { AccountSideNavProps } from '@common/RouteDestinations'

RbacFactory.registerResourceTypeHandler(ResourceType.DELEGATE, {
  icon: 'res-delegates',
  label: 'delegate.delegates',
  category: ResourceCategory.SHARED_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.VIEW_DELEGATE]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_DELEGATE]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_DELEGATE]: <String stringID="rbac.permissionLabels.delete" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <DelegateResourceModalBody {...props} />,
  // eslint-disable-next-line react/display-name
  staticResourceRenderer: props => <DelegateResourceRenderer {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.DELEGATECONFIGURATION, {
  icon: 'res-delegates',
  label: 'delegate.delegateConfigurations',
  category: ResourceCategory.SHARED_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.VIEW_DELEGATE_CONFIGURATION]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_DELEGATE_CONFIGURATION]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_DELEGATE_CONFIGURATION]: <String stringID="rbac.permissionLabels.delete" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <DelegateConfigurationResourceModalBody {...props} />,
  // eslint-disable-next-line react/display-name
  staticResourceRenderer: props => <DelegateConfigurationResourceRenderer {...props} />
})

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={[routes.toDelegates({ ...accountPathProps })]} exact>
      <DelegatesPage />
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={[routes.toDelegatesDetails({ ...accountPathProps, ...delegatePathProps })]}
    >
      <DelegateDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={[routes.toDelegateConfigsDetails({ ...accountPathProps, ...delegateConfigProps })]}
    >
      <DelegateProfileDetails />
    </RouteWithLayout>
  </>
)
