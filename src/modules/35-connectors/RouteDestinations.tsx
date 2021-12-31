import React from 'react'

import AuditTrailFactory from '@audit-trail/factories/AuditTrailFactory'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, connectorPathProps } from '@common/utils/routeUtils'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import CreateConnectorFromYamlPage from '@connectors/pages/createConnectorFromYaml/CreateConnectorFromYamlPage'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { String } from 'framework/strings'
import { AccountSideNavProps } from '@common/RouteDestinations'
import type { ResourceDTO, ResourceScopeDTO } from 'services/audit'
import ConnectorResourceModalBody from './components/ConnectorResourceModalBody/ConnectorResourceModalBody'

RbacFactory.registerResourceTypeHandler(ResourceType.CONNECTOR, {
  icon: 'res-connectors',
  label: 'connectorsLabel',
  category: ResourceCategory.SHARED_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CONNECTOR]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_CONNECTOR]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CONNECTOR]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.ACCESS_CONNECTOR]: <String stringID="rbac.permissionLabels.access" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <ConnectorResourceModalBody {...props} />
})

AuditTrailFactory.registerResourceHandler('CONNECTOR', {
  moduleIcon: {
    name: 'nav-settings',
    size: 30
  },
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScopeDTO) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    if (accountIdentifier) {
      return routes.toConnectorDetails({
        orgIdentifier,
        accountId: accountIdentifier,
        connectorId: resource.identifier,
        projectIdentifier
      })
    }
    return undefined
  }
})

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toConnectors({ ...accountPathProps })} exact>
      <ConnectorsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toConnectorDetails({ ...accountPathProps, ...connectorPathProps })}
      exact
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routes.toCreateConnectorFromYaml({ ...accountPathProps })}
      exact
    >
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>
  </>
)
