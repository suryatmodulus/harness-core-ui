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
import RbacButton from '@rbac/components/Button/Button'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { usePermission } from '@rbac/hooks/usePermission'

// Due to some typing complexity, governance/App is lazily imported
// from a .js file for now
const RemoteGovernanceApp = lazy(() => import('governance/App'))

export const RemoteEvaluationModal = lazy(() => import('governance/EvaluationModal'))
export const RemotePipelineGovernanceView = lazy(() => import('governance/PipelineGovernanceView'))
export const RemoteEvaluationView = lazy(() => import('governance/EvaluationView'))

export const GovernanceRemoteComponentMounter = props => {
  const { spinner, component } = props
  const { getString } = useStrings()
  const { path, params } = useRouteMatch()
  const history = useHistory()

  return (
    <Suspense fallback={spinner || <Container padding="large">{getString('loading')}</Container>}>
      <AppErrorBoundary>
        <RemoteGovernanceApp
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
          hooks={{
            usePermission
          }}
          components={{
            NGBreadcrumbs,
            RbacButton,
            RbacOptionsMenuButton
          }}
        >
          {component}
        </RemoteGovernanceApp>
      </AppErrorBoundary>
    </Suspense>
  )
}
