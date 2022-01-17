/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'

import { useHistory, useParams } from 'react-router-dom'
import { RestfulProvider } from 'restful-react'
import { FocusStyleManager } from '@blueprintjs/core'
import { TooltipContextProvider } from '@wings-software/uicore'
import { tooltipDictionary } from '@wings-software/ng-tooltip'
import { setAutoFreeze, enableMapSet } from 'immer'
import SessionToken from 'framework/utils/SessionToken'

import { AppStoreProvider } from 'framework/AppStore/AppStoreContext'
import { LicenseStoreProvider } from 'framework/LicenseStore/LicenseStoreContext'
// eslint-disable-next-line aliased-module-imports
import RouteDestinations from 'modules/RouteDestinations'
// eslint-disable-next-line aliased-module-imports
import RouteDestinationsWithoutAuth from 'modules/RouteDestinationsWithoutAuth'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'
import { StringsContextProvider } from 'framework/strings/StringsContextProvider'
import { getLoginPageURL } from 'framework/utils/SessionUtils'
import { NGTooltipEditorPortal } from 'framework/tooltip/TooltipEditor'
import AppStorage from 'framework/utils/AppStorage'
import { useRefreshToken } from 'services/portal'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

import './App.scss'
import routes from '@common/RouteDefinitions'
import { returnUrlParams } from '@common/utils/routeUtils'
import { PermissionsProvider } from 'framework/rbac/PermissionsContext'
import { FeaturesProvider } from 'framework/featureStore/FeaturesContext'
import { identifyFullStoryUser } from '../../3rd-party/FullStory'

FocusStyleManager.onlyShowFocusOnTabs()

// set up Immer
setAutoFreeze(false)
enableMapSet()

interface AppProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  strings: Record<string, any>
}

const Harness = (window.Harness = window.Harness || {})

export function AppWithAuthentication(props: AppProps): React.ReactElement {
  const token = SessionToken.getToken()
  const username = SessionToken.username()
  // always use accountId from URL, and not from local storage
  // if user lands on /, they'll first get redirected to a path with accountId
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()

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

  const {
    data: refreshTokenResponse,
    refetch: refreshToken,
    loading: refreshingToken
  } = useRefreshToken({
    lazy: true,
    requestOptions: getRequestOptions()
  })

  useEffect(() => {
    if (!token) {
      history.push({
        pathname: routes.toRedirect(),
        search: returnUrlParams(getLoginPageURL({ returnUrl: window.location.href }))
      })
    }
  }, [history, token])

  useEffect(() => {
    if (refreshTokenResponse?.resource) {
      AppStorage.set('token', refreshTokenResponse.resource)
      AppStorage.set('lastTokenSetTime', +new Date())
    }
  }, [refreshTokenResponse])

  useEffect(() => {
    // Allow FullStory to recognize current user
    identifyFullStoryUser({ username })
  }, [username])

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
  Harness.openTooltipEditor = () => setShowTooltipEditor(true)

  return (
    <RestfulProvider
      base="/"
      requestOptions={getRequestOptions}
      queryParams={getQueryParams()}
      queryParamStringifyOptions={{ skipNulls: true }}
      onResponse={response => {
        if (!response.ok && response.status === 401) {
          AppStorage.clear()
          history.push({
            pathname: routes.toRedirect(),
            search: returnUrlParams(getLoginPageURL({ returnUrl: window.location.href }))
          })
          return
        }

        checkAndRefreshToken()
      }}
    >
      <StringsContextProvider initialStrings={props.strings}>
        <TooltipContextProvider initialTooltipDictionary={tooltipDictionary}>
          <AppStoreProvider>
            <AppErrorBoundary>
              <FeaturesProvider>
                <LicenseStoreProvider>
                  <PermissionsProvider>
                    <RouteDestinations />
                    <NGTooltipEditorPortal
                      showTooltipEditor={showTooltipEditor}
                      onEditorClose={() => setShowTooltipEditor(false)}
                    />
                  </PermissionsProvider>
                </LicenseStoreProvider>
              </FeaturesProvider>
            </AppErrorBoundary>
          </AppStoreProvider>
        </TooltipContextProvider>
      </StringsContextProvider>
    </RestfulProvider>
  )
}

export function AppWithoutAuthentication(props: AppProps): React.ReactElement {
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
