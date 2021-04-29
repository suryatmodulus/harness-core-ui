import React from 'react'
import { Redirect, useParams } from 'react-router'
import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, secretPathProps } from '@common/utils/routeUtils'

import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import SecretReferences from '@secrets/pages/secretReferences/SecretReferences'
import SecretDetailsHomePage from '@secrets/pages/secretDetailsHomePage/SecretDetailsHomePage'
import CreateSecretFromYamlPage from '@secrets/pages/createSecretFromYaml/CreateSecretFromYamlPage'
import AccountSettingsSideNav from '@common/navigation/AccountSettingsSideNav/AccountSettingsSideNav'
import ResourcesPage from '@common/pages/resources/ResourcesPage'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import SecretResourceModalBody from '@secrets/components/SecretResourceModalBody/SecretResourceModalBody'
import type { ModulePathParams, ProjectPathProps, SecretsPathProps } from '@common/interfaces/RouteInterfaces'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String } from 'framework/strings'

const AccountSettingsSideNavProps: SidebarContext = {
  navComponent: AccountSettingsSideNav,
  subtitle: 'ACCOUNT',
  title: 'Settings',
  icon: 'nav-settings'
}

RbacFactory.registerResourceTypeHandler(ResourceType.SECRET, {
  icon: 'lock',
  label: 'Secrets',
  category: ResourceCategory.SHARED_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.VIEW_SECRET]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_SECRET]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_SECRET]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.ACCESS_SECRET]: <String stringID="rbac.permissionLabels.access" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <SecretResourceModalBody {...props} />
})

const RedirectToSecretDetailHome = () => {
  const { accountId, projectIdentifier, orgIdentifier, secretId, module } = useParams<
    ProjectPathProps & SecretsPathProps & ModulePathParams
  >()
  return (
    <Redirect
      to={routes.toResourcesSecretDetailsOverview({ accountId, projectIdentifier, orgIdentifier, secretId, module })}
    />
  )
}

export default (
  <>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[routes.toResourcesSecrets({ ...accountPathProps }), routes.toResourcesSecrets({ ...orgPathProps })]}
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
        routes.toResourcesSecretDetails({
          ...accountPathProps,
          ...orgPathProps,
          ...secretPathProps
        })
      ]}
      exact
    >
      <RedirectToSecretDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toResourcesSecretDetailsOverview({ ...accountPathProps, ...secretPathProps }),
        routes.toResourcesSecretDetailsOverview({
          ...accountPathProps,
          ...orgPathProps,
          ...secretPathProps
        })
      ]}
      exact
    >
      <SecretDetailsHomePage>
        <SecretDetails />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toResourcesSecretDetailsReferences({ ...accountPathProps, ...secretPathProps }),
        routes.toResourcesSecretDetailsReferences({
          ...accountPathProps,
          ...orgPathProps,
          ...secretPathProps
        })
      ]}
      exact
    >
      <SecretDetailsHomePage>
        <SecretReferences />
      </SecretDetailsHomePage>
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
export { RedirectToSecretDetailHome }
