import React, { Suspense } from 'react'
import { Container } from '@wings-software/uicore'
import { useRouteMatch, useHistory } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { accountPathProps, returnUrlParams } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'
import AppStorage from 'framework/utils/AppStorage'
import { getLoginPageURL } from 'framework/utils/SessionUtils'
import AccountSideNav from '@common/components/AccountSideNav/AccountSideNav'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { GovernanceApp } from './GovernanceApp'

export const AccountSideNavProps: SidebarContext = {
  navComponent: AccountSideNav,
  icon: 'nav-settings',
  title: 'Account Settings'
}

const AppLoader: React.FC = () => {
  const { url, path, params } = useRouteMatch()
  const history = useHistory()

  return (
    <Suspense
      fallback={
        <Container
          style={{
            position: 'fixed',
            top: 0,
            left: '290px',
            width: 'calc(100% - 290px)',
            height: `100%`
          }}
        >
          <ContainerSpinner />
        </Container>
      }
    >
      <AppErrorBoundary>
        {/* TODO: @see ChildAppMounter */}
        <GovernanceApp
          basePath={path}
          baseURL={url}
          params={params}
          apiToken={AppStorage.get('token')}
          on401={() => {
            AppStorage.clear()
            history.push({
              pathname: routes.toRedirect(),
              search: returnUrlParams(getLoginPageURL({ returnUrl: window.location.href }))
            })
          }}
        />
      </AppErrorBoundary>
    </Suspense>
  )
}

export default (
  <>
    <RouteWithLayout path={routes.toGovernance({ ...accountPathProps })} sidebarProps={AccountSideNavProps}>
      <AppLoader />
    </RouteWithLayout>
  </>
)
