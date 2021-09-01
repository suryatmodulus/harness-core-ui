import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Switch, Route } from 'react-router-dom'
import languageLoader, { LangLocale } from 'strings/languageLoader'
import { AppWithAuthentication, AppWithoutAuthentication } from './bootstrap'
;(async () => {
  const lang: LangLocale = 'en'
  const strings = await languageLoader(lang)
  if (window.bugsnagToken && typeof Bugsnag !== 'undefined' && Bugsnag.start) {
    window.bugsnagClient = Bugsnag.start({
      apiKey: window.bugsnagToken,
      appVersion: __BUGSNAG_RELEASE_VERSION__,
      releaseStage: `ng-ui-${window.location.hostname.split('.')[0]}`
    })
  }
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
