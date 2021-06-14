import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { RestfulProvider } from 'restful-react'
import { FocusStyleManager } from '@blueprintjs/core'
import { TooltipContextProvider } from '@wings-software/uicore'
import { tooltipDictionary } from '@wings-software/ng-tooltip'
import { setAutoFreeze, enableMapSet } from 'immer'
import SessionToken from 'framework/utils/SessionToken'
import languageLoader from 'strings/languageLoader'
import type { LangLocale } from 'strings/languageLoader'
import { AppStoreProvider } from 'framework/AppStore/AppStoreContext'
import { LicenseStoreProvider } from 'framework/LicenseStore/LicenseStoreContext'
// eslint-disable-next-line aliased-module-imports
import RouteDestinations from 'modules/RouteDestinations'
// eslint-disable-next-line aliased-module-imports
import RouteDestinationsWithoutAuth from 'modules/RouteDestinationsWithoutAuth'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'
import { StringsContextProvider } from 'framework/strings/StringsContextProvider'
import { PermissionsProvider } from '@rbac/interfaces/PermissionsContext'
import { getLoginPageURL } from 'framework/utils/SessionUtils'
import { NGTooltipEditorPortal } from 'framework/tooltip/TooltipEditor'
import AppStorage from 'framework/utils/AppStorage'

import './App.scss'
import { useRefreshToken } from 'services/portal'

FocusStyleManager.onlyShowFocusOnTabs()

// set up Immer
setAutoFreeze(false)
enableMapSet()

interface AppProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  strings: Record<string, any>
}

const Harness = (window.Harness = window.Harness || {})

function AppWithAuthentication(props: AppProps): React.ReactElement {
  const token = SessionToken.getToken()
  const accountId = SessionToken.accountId()

  const getRequestOptions = React.useCallback((): Partial<RequestInit> => {
    const headers: RequestInit['headers'] = {}

    if (token && token.length > 0) {
      headers.Authorization = `Bearer ${token}`
    }

    return { headers }
  }, [token])

  const getQueryParams = React.useCallback(() => {
    return {
      routingId: accountId
    }
  }, [accountId])

  const { data: refreshTokenResponse, refetch: refreshToken, loading: refreshingToken } = useRefreshToken({
    lazy: true,
    requestOptions: getRequestOptions()
  })

  useEffect(() => {
    if (!token) {
      window.location.href = getLoginPageURL()
    }
  }, [token])

  useEffect(() => {
    if (refreshTokenResponse?.resource) {
      AppStorage.set('token', refreshTokenResponse.resource)
      AppStorage.set('lastTokenSetTime', +new Date())
    }
  }, [refreshTokenResponse])

  const checkAndRefreshToken = (): void => {
    const currentTime = +new Date()
    const lastTokenSetTime = SessionToken.getLastTokenSetTime() as number
    const refreshInterval = 60 * 60 * 1000 // one hour in milliseconds
    if (currentTime - lastTokenSetTime > refreshInterval && !refreshingToken) {
      refreshToken()
    }
  }

  const [showTooltipEditor, setShowTooltipEditor] = useState(false)
  Harness.openNgTooltipEditor = () => setShowTooltipEditor(true)

  return (
    <RestfulProvider
      base="/"
      requestOptions={getRequestOptions}
      queryParams={getQueryParams()}
      queryParamStringifyOptions={{ skipNulls: true }}
      onResponse={response => {
        if (!response.ok && response.status === 401) {
          // 401 might be returned due to RBAC maybe?
          // check response body to confirm invalid token
          // response.json().then(body => {
          //   if (['INVALID_TOKEN', 'EXPIRED_TOKEN'].indexOf(body?.code) > -1) {
          AppStorage.clear()
          window.location.href = getLoginPageURL()
          return
          // }
          // })
        }

        checkAndRefreshToken()
      }}
    >
      <StringsContextProvider initialStrings={props.strings}>
        <TooltipContextProvider initialTooltipDictionary={tooltipDictionary}>
          <AppStoreProvider>
            <AppErrorBoundary>
              <LicenseStoreProvider>
                <PermissionsProvider>
                  <RouteDestinations />
                  <NGTooltipEditorPortal
                    showTooltipEditor={showTooltipEditor}
                    onEditorClose={() => setShowTooltipEditor(false)}
                  />
                </PermissionsProvider>
              </LicenseStoreProvider>
            </AppErrorBoundary>
          </AppStoreProvider>
        </TooltipContextProvider>
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
            '/account/:accountId/orgs/:orgIdentifier/projects/:projectIdentifier',
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
