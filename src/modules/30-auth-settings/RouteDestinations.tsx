import React from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Route, useParams, Redirect, Switch } from 'react-router-dom'
import { createClient, Provider, dedupExchange, cacheExchange, fetchExchange } from 'urql'
import { requestPolicyExchange } from '@urql/exchange-request-policy'

import Configuration from '@auth-settings/pages/Configuration/Configuration'
import AccountOverview from '@auth-settings/pages/AccountOverview/AccountOverview'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import SubscriptionsPage from '@auth-settings/pages/subscriptions/SubscriptionsPage'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'

import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String } from 'framework/strings'
import { AccountSideNavProps } from '@common/RouteDestinations'

RbacFactory.registerResourceTypeHandler(ResourceType.ACCOUNT, {
  icon: 'nav-settings',
  label: 'common.accountSettings',
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

const RedirectToOverview = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()
  return <Redirect to={routes.toAccountSettingsOverview(params)} />
}

const AuthSettingsRoutes: React.FC = () => {
  const urqlClient = React.useCallback(() => {
    const url = 'https://harness.dragonson.com/graphql'
    return createClient({
      url,
      exchanges: [dedupExchange, requestPolicyExchange({}), cacheExchange, fetchExchange],
      requestPolicy: 'cache-first'
    })
  }, [])

  const stripePromise = loadStripe(
    'pk_test_51IzYnIK1vsc7tc8yri9N5swmDxflQhIkAQbVxepcq1YoRlvUDgCJNGaoPCcSqyfOQt5tyRy4a3OBhezumJpPtm3100xKIx3aZ6'
  )

  const options = {
    // passing the client secret obtained in step 2
    clientSecret:
      'sk_test_51IzYnIK1vsc7tc8y6jZOJZyWHApHYNQJdcfCYKkhkxM4fHz1VnyzoHb3UpgqEUSeKuNQQPWnJfJcw0OufgJlnCLa00Pk2IGjvr',
    // Fully customizable with appearance API.
    appearance: {
      /*...*/
    }
  }

  return (
    <Provider value={urqlClient()}>
      <Switch>
        <RouteWithLayout
          sidebarProps={AccountSideNavProps}
          path={routes.toAccountSettings({ ...accountPathProps })}
          exact
        >
          <RedirectToOverview />
        </RouteWithLayout>
        <Route sidebarProps={AccountSideNavProps} path={routes.toAuthenticationSettings({ ...accountPathProps })} exact>
          <RedirectToConfiguration />
        </Route>
        <RouteWithLayout
          sidebarProps={AccountSideNavProps}
          path={routes.toAccountConfiguration({ ...accountPathProps })}
          exact
        >
          <Configuration />
        </RouteWithLayout>
        <RouteWithLayout
          sidebarProps={AccountSideNavProps}
          path={routes.toAccountSettingsOverview({ ...accountPathProps })}
          exact
        >
          <AccountOverview />
        </RouteWithLayout>
        <Elements stripe={stripePromise} options={options}>
          <RouteWithLayout
            sidebarProps={AccountSideNavProps}
            path={routes.toSubscriptions({ ...accountPathProps })}
            exact
          >
            <SubscriptionsPage />
          </RouteWithLayout>
        </Elements>
        <Route path="*">
          <NotFoundPage />
        </Route>
      </Switch>
    </Provider>
  )
}

export default AuthSettingsRoutes
