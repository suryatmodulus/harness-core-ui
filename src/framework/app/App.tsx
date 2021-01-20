import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { RestfulProvider } from 'restful-react'
import { FocusStyleManager } from '@blueprintjs/core'
import SessionToken from 'framework/utils/SessionToken'
import languageLoader from 'strings/languageLoader'
import type { LangLocale } from 'strings/languageLoader'
import { AppStoreProvider } from 'framework/AppStore/AppStoreContext'
import RouteDestinations from 'modules/RouteDestinations'
import RouteDestinationsWithoutAuth from 'modules/RouteDestinationsWithoutAuth'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'

import '@common/services'
import './App.scss'

FocusStyleManager.onlyShowFocusOnTabs()

const LOGIN_PAGE_URL = '/#/login'

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
      window.location.href = LOGIN_PAGE_URL
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
          window.location.href = LOGIN_PAGE_URL
          // }
          // })
        }
      }}
    >
      <AppStoreProvider strings={props.strings}>
        <AppErrorBoundary>
          <RouteDestinations />
        </AppErrorBoundary>
      </AppStoreProvider>
    </RestfulProvider>
  )
}

function AppWithoutAuthentication(): React.ReactElement {
  return (
    <AppErrorBoundary>
      <RouteDestinationsWithoutAuth />
    </AppErrorBoundary>
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
            '/account/:accountId'
          ]}
        >
          <AppWithAuthentication strings={strings} />
        </Route>
        <Route path="/">
          <AppWithoutAuthentication />
        </Route>
      </Switch>
    </HashRouter>,
    document.getElementById('react-root')
  )
})()
