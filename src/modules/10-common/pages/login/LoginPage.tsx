import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Callout } from '@blueprintjs/core'
import { FormInput, Formik, FormikForm, Card, Button, Layout } from '@wings-software/uicore'
import AppStorage from 'framework/utils/AppStorage'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/components'

import css from './LoginPage.module.scss'

interface LoginForm {
  email: string
  password: string
}

const createAuthToken = (login: string, password: string): string => {
  const encodedToken = btoa(login + ':' + password)
  return `Basic ${encodedToken}`
}

/**
 * This page is meant only for dev-testing to allow easier login
 * using email/password on internal environments, until the real
 * login page gets moved from current gen UI.
 *
 * It should only be rendered behind the __DEV__ flag.
 */

const LoginPage: React.FC = () => {
  const history = useHistory()
  const { showError } = useToaster()

  const handleLogin = async (data: LoginForm): Promise<void> => {
    try {
      // hacky/temporary fetch call
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ authorization: createAuthToken(data.email, data.password) })
      })

      const json = await response.json()
      AppStorage.set('token', json.resource.token)
      AppStorage.set('acctId', json.resource.defaultAccountId)
      AppStorage.set('lastTokenSetTime', +new Date())

      history.push(routes.toProjects({ accountId: json.resource.defaultAccountId }))
    } catch (e) {
      showError(e)
    }
  }

  const handleSubmit = (data: LoginForm): void => {
    handleLogin(data)
  }

  return (
    <div className={css.loginPage}>
      <Card className={css.card}>
        <Layout.Vertical spacing="large">
          <Formik<LoginForm> initialValues={{ email: '', password: '' }} onSubmit={handleSubmit}>
            <FormikForm>
              <FormInput.Text name="email" label="Email" />
              <FormInput.Text name="password" label="Password" inputGroup={{ type: 'password' }} />
              <Button type="submit" intent="primary">
                Submit
              </Button>
            </FormikForm>
          </Formik>
          <Link to={routes.toSignup()}>Sign up for an account</Link>
          <Callout intent="warning">This page is only meant for dev testing</Callout>
        </Layout.Vertical>
      </Card>
    </div>
  )
}

export default LoginPage
