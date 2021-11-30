import React, { Suspense, lazy } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { returnUrlParams } from '@common/utils/routeUtils'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'
import { useStrings } from 'framework/strings'
import AppStorage from 'framework/utils/AppStorage'
import { getLoginPageURL } from 'framework/utils/SessionUtils'

// Due to some typing complexity, samplemodule/App is lazily imported
// from a .js file for now
const RemoteSampleModuleApp = lazy(() => import('samplemodule/App'))

export const RemoteTestView = lazy(() => import('samplemodule/TestView'))

export const SampleModuleRemoteComponentMounter = props => {
  const { spinner, component } = props
  const { getString } = useStrings()
  const { path, params } = useRouteMatch()
  const history = useHistory()

  return (
    <Suspense fallback={spinner || <Container padding="large">{getString('loading')}</Container>}>
      <AppErrorBoundary>
        <RemoteSampleModuleApp
          baseRoutePath={path}
          accountId={params.accountId}
          apiToken={AppStorage.get('token')}
          on401={() => {
            AppStorage.clear()
            history.push({
              pathname: routes.toRedirect(),
              search: returnUrlParams(getLoginPageURL({ returnUrl: window.location.href }))
            })
          }}
          components={{
            NGBreadcrumbs
          }}
        >
          {component}
        </RemoteSampleModuleApp>
      </AppErrorBoundary>
    </Suspense>
  )
}
