import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'

import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { accountPathProps, connectorPathProps } from '@common/utils/routeUtils'
import ConnectorsPage from '@connectors/pages/connectors/ConnectorsPage'
import ConnectorDetailsPage from '@connectors/pages/connectors/ConnectorDetailsPage'
import CreateConnectorFromYamlPage from '@connectors/pages/createConnectorFromYaml/CreateConnectorFromYamlPage'
import ResourcesPage from '@common/pages/resources/ResourcesPage'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { String } from 'framework/strings'
import HomeSideNav from '@common/components/HomeSideNav/HomeSideNav'
import ConnectorResourceModalBody from './components/ConnectorResourceModalBody/ConnectorResourceModalBody'

const RedirectToOrgResourcesHome = (): React.ReactElement => {
  const params = useParams<OrgPathProps>()

  return <Redirect to={routes.toConnectors(params)} />
}

const HomeSideNavProps: SidebarContext = {
  navComponent: HomeSideNav,
  icon: 'harness'
}

RbacFactory.registerResourceTypeHandler(ResourceType.CONNECTOR, {
  icon: 'lock',
  label: 'Connectors',
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

export default (
  <>
    <Route exact path={routes.toResources({ ...accountPathProps })}>
      <RedirectToOrgResourcesHome />
    </Route>
    <RouteWithLayout sidebarProps={HomeSideNavProps} path={routes.toConnectors({ ...accountPathProps })} exact>
      <ResourcesPage>
        <ConnectorsPage />
      </ResourcesPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={routes.toConnectorDetails({ ...accountPathProps, ...connectorPathProps })}
      exact
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={HomeSideNavProps}
      path={routes.toCreateConnectorFromYaml({ ...accountPathProps })}
      exact
    >
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>
  </>
)
