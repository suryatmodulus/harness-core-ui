import React from 'react'

import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, secretPathProps } from '@common/utils/routeUtils'

import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import {RedirectToSecretDetailHome} from '@common/RouteDestinations'
import SeceretsActivity from '@secrets/pages/secretsActivity/SecretsActivity'
import SeceretsReferences from '@secrets/pages/secretsReferences/SecretsReferences'
import SecretsDetailHomePage from '@secrets/pages/secretsDetailHomePage/SecretsDetailHomePage'
import CreateSecretFromYamlPage from '@secrets/pages/createSecretFromYaml/CreateSecretFromYamlPage'
import AccountSettingsSideNav from '@common/navigation/AccountSettingsSideNav/AccountSettingsSideNav'
import ResourcesPage from '@common/pages/resources/ResourcesPage'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceType } from '@rbac/interfaces/ResourceType'

const AccountSettingsSideNavProps: SidebarContext = {
  navComponent: AccountSettingsSideNav,
  subtitle: 'ACCOUNT',
  title: 'Settings',
  icon: 'nav-settings'
}

RbacFactory.registerResourceTypeHandler(ResourceType.SECRET, {
  icon: 'lock',
  label: 'Secrets',
  // eslint-disable-next-line react/display-name
  addResourceModalBody: () => <></>
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
      <RedirectToSecretDetailHome />
      
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toSecretDetailsOverview({ ...accountPathProps, ...secretPathProps }),
        routes.toSecretDetailsOverview({
          ...accountPathProps,
          ...orgPathProps,
          ...secretPathProps
        })
      ]}
      exact
    >
      <SecretsDetailHomePage>
        <SecretDetails /></SecretsDetailHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps }),
        routes.toSecretDetailsReferences({
          ...accountPathProps,
          ...orgPathProps,
          ...secretPathProps
        })
      ]}
      exact
    >
      <SecretsDetailHomePage>
        <SeceretsReferences /></SecretsDetailHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSettingsSideNavProps}
      path={[
        routes.toSecretDetailsActivity({ ...accountPathProps, ...secretPathProps }),
        routes.toSecretDetailsActivity({
          ...accountPathProps,
          ...orgPathProps,
          ...secretPathProps
        })
      ]}
      exact
    >
      <SecretsDetailHomePage>
        <SeceretsActivity /></SecretsDetailHomePage>
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
