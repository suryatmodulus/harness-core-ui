import React from 'react'

import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, secretPathProps } from '@common/utils/routeUtils'

import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import CreateSecretFromYamlPage from '@secrets/pages/createSecretFromYaml/CreateSecretFromYamlPage'
import AccountSettingsSideNav from '@common/navigation/AccountSettingsSideNav/AccountSettingsSideNav'
import ResourcesPage from '@common/pages/resources/ResourcesPage'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceType, ResourceTypeGroup } from '@rbac/interfaces/ResourceType'
import SecretResourceModalBody from '@secrets/components/SecretResourceModalBody/SecretResourceModalBody'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String } from 'framework/exports'

const AccountSettingsSideNavProps: SidebarContext = {
  navComponent: AccountSettingsSideNav,
  subtitle: 'ACCOUNT',
  title: 'Settings',
  icon: 'nav-settings'
}

RbacFactory.registerResourceTypeHandler(ResourceType.SECRET, {
  icon: 'lock',
  label: 'Secrets',
  category: ResourceTypeGroup.PROJECT_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.UPDATE_SECRET]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.VIEW_SECRET]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.DELETE_SECRET]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.ACCESS_SECRET]: <String stringID="rbac.permissionLabels.access" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <SecretResourceModalBody {...props} />
})

export default (
  <>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toResourcesSecretsListing({ ...accountPathProps }),
        routes.toOrgResourcesSecretsListing({ ...accountPathProps, ...orgPathProps })
      ]}
      exact
    >
      <ResourcesPage>
        <SecretsPage />
      </ResourcesPage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toResourcesSecretDetails({ ...accountPathProps, ...secretPathProps }),
        routes.toOrgResourcesSecretDetails({
          ...accountPathProps,
          ...orgPathProps,
          ...secretPathProps
        })
      ]}
      exact
    >
      <SecretDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toCreateSecretFromYaml({ ...accountPathProps }),
        routes.toCreateSecretFromYaml({ ...accountPathProps, ...orgPathProps })
      ]}
      exact
    >
      <CreateSecretFromYamlPage />
    </RouteWithLayout>
  </>
)
