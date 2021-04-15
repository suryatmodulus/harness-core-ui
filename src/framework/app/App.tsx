import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { RestfulProvider } from 'restful-react'
import { FocusStyleManager } from '@blueprintjs/core'
import { setAutoFreeze, enableMapSet } from 'immer'
import SessionToken from 'framework/utils/SessionToken'
import languageLoader from 'strings/languageLoader'
import type { LangLocale } from 'strings/languageLoader'
import { AppStoreProvider } from 'framework/AppStore/AppStoreContext'
// eslint-disable-next-line aliased-module-imports
import RouteDestinations from 'modules/RouteDestinations'
// eslint-disable-next-line aliased-module-imports
import RouteDestinationsWithoutAuth from 'modules/RouteDestinationsWithoutAuth'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'
import { StringsContextProvider } from 'framework/strings/StringsContextProvider'
import { PermissionsProvider } from '@rbac/interfaces/PermissionsContext'

import './App.scss'

FocusStyleManager.onlyShowFocusOnTabs()

// pick current path, but remove `/ng/`
const getLoginPageURL = (): string => {
  const redirectUrl = encodeURIComponent(window.location.href)

  return `${window.location.pathname.replace(/\/ng\//, '/')}#/login?returnUrl=${redirectUrl}`
}
// set up Immer
setAutoFreeze(false)
enableMapSet()

interface AppProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  strings: Record<string, any>
}

function AppWithAuthentication(props: AppProps): React.ReactElement {
  const token = SessionToken.getToken()

  const getRequestOptions = React.useCallback((): Partial<RequestInit> => {
    const headers: RequestInit['headers'] = {}

    if (token && token.length > 0) {
      headers.Authorization = `Bearer ${token}`
    }

    return { headers }
  }, [token])

  useEffect(() => {
    if (!token) {
      window.location.href = getLoginPageURL()
    }
  }, [token])

  return (
    <RestfulProvider
      base="/"
      requestOptions={getRequestOptions}
      onResponse={response => {
        if (!response.ok && response.status === 401) {
          // 401 might be returned due to RBAC maybe?
          // check response body to confirm invalid token
          // response.json().then(body => {
          //   if (['INVALID_TOKEN', 'EXPIRED_TOKEN'].indexOf(body?.code) > -1) {
          window.location.href = getLoginPageURL()
          // }
          // })
        }
      }}
    >
      <StringsContextProvider initialStrings={props.strings}>
        <AppStoreProvider>
          <AppErrorBoundary>
            <PermissionsProvider>
              <RouteDestinations />
            </PermissionsProvider>
          </AppErrorBoundary>
        </AppStoreProvider>
      </StringsContextProvider>
    </RestfulProvider>
  )
}

function AppWithoutAuthentication(props: AppProps): React.ReactElement {
  return (
    <RestfulProvider base="/">
      <StringsContextProvider initialStrings={props.strings}>
        <AppErrorBoundary>
          <RouteDestinationsWithoutAuth />
        </AppErrorBoundary>
      </StringsContextProvider>
    </RestfulProvider>
  )
}

;(async () => {
  const lang: LangLocale = 'en'

  const strings = await languageLoader(lang)

  ReactDOM.render(
    <HashRouter>
      <Switch>
        <Route
          path={[
            // this path is needed for AppStoreProvider to populate accountId, orgId and projectId
            '/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier',
            '/account/:accountId/projects/:projectIdentifier/orgs/:orgIdentifier',
            '/account/:accountId'
          ]}
        >
          <AppWithAuthentication strings={strings} />
        </Route>
        <Route path="/">
          <AppWithoutAuthentication strings={strings} />
        </Route>
      </Switch>
    </HashRouter>,
    document.getElementById('react-root')
  )
})()
