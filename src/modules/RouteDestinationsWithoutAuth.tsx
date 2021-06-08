import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import routes from '@common/RouteDefinitions'
import SessionToken from 'framework/utils/SessionToken'
import LoginPage from '@common/pages/login/LoginPage'
import SignupPage from '@common/pages/signup/SignupPage'
import { getLoginPageURL } from 'framework/utils/SessionUtils'

const RedirectToHome: React.FC = () => {
  const accountId = SessionToken.accountId()
  if (accountId) {
    return <Redirect to={routes.toHome({ accountId })} />
  } else {
    window.location.href = getLoginPageURL(false)
    return null
  }
}

const RouteDestinationsWithoutAuth: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/">
        <RedirectToHome />
      </Route>
      {__DEV__ ? (
        <Route path={routes.toLogin()}>
          <LoginPage />
        </Route>
      ) : null}
      {__DEV__ ? (
        <Route path={routes.toSignup()}>
          <SignupPage />
        </Route>
      ) : null}
      <Route path="*">
        <NotFoundPage />
      </Route>
    </Switch>
  )
}

export default RouteDestinationsWithoutAuth
