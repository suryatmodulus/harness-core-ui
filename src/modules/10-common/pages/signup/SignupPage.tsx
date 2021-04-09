import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import * as Yup from 'yup'
import {
  Button,
  Color,
  FormInput,
  Formik,
  FormikForm,
  HarnessIcons,
  Icon,
  OverlaySpinner,
  Container,
  Text
} from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/components'
import { useQueryParams } from '@common/hooks'
import { useSignupUser, SignupUserRequestBody } from 'services/portal'
import AuthLayout from '@common/components/AuthLayout/AuthLayout'
import AppStorage from 'framework/utils/AppStorage'

import AuthFooter, { AuthPage } from '@common/components/AuthLayout/AuthFooter/AuthFooter'
import { useStrings } from 'framework/exports'
import { getModuleNameByString, getHomeLinkByAcctIdAndModuleName } from '../../utils/StringUtils'

interface SignupForm {
  name: string
  email: string
  password: string
}

const createAuthToken = (login: string, password: string): string => {
  const encodedToken = btoa(login + ':' + password)
  return `Basic ${encodedToken}`
}

const refreshAppStore = async (email: string, password: string): Promise<void> => {
  const response = await fetch('/api/users/login', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      authorization: createAuthToken(email, password)
    })
  })
  if (response.ok) {
    const json = await response.json()
    AppStorage.set('token', json.resource.token)
    AppStorage.set('acctId', json.resource.defaultAccountId)
    AppStorage.set('uuid', json.resource.uuid)
    AppStorage.set('lastTokenSetTime', +new Date())
  }
}

const SignupPage: React.FC = () => {
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { module: moduleType } = useQueryParams<{ module?: string }>()
  const { mutate: getUserInfo } = useSignupUser({})
  const history = useHistory()
  const [loading, setLoading] = useState(false)

  const HarnessLogo = HarnessIcons['harness-logo-black']

  const handleSignup = async (data: SignupForm): Promise<void> => {
    setLoading(true)
    const module = getModuleNameByString(moduleType)
    const { name, email, password } = data

    const dataToSubmit: SignupUserRequestBody = {
      name,
      email,
      module,
      password
    }

    try {
      const userInfoResponse = await getUserInfo(dataToSubmit)
      // call login api to refresh app store
      // TODO: this work will get done on backend in near future
      const accountId = userInfoResponse.resource.accountIds[0]
      await refreshAppStore(email, password)
      history.push(getHomeLinkByAcctIdAndModuleName(accountId, module))
    } catch (error) {
      showError(error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(data: SignupForm): void {
    handleSignup(data)
  }

  const spinner = (
    <OverlaySpinner show>
      <></>
    </OverlaySpinner>
  )

  const submitButton = (
    <Button type="submit" intent="primary" width="100%">
      {getString('signUp.signUp')}
    </Button>
  )

  return (
    <>
      <AuthLayout>
        <Container flex={{ justifyContent: 'space-between', alignItems: 'center' }} margin={{ bottom: 'xxxlarge' }}>
          <HarnessLogo height={25} />
          <Link to={routes.toLogin()}>
            <Icon name="arrow-left" color={Color.BLUE_500} margin={{ right: 'xsmall' }} />
            <Text color={Color.BLUE_500} inline font={{ size: 'medium' }}>
              {getString('signUp.signIn')}
            </Text>
          </Link>
        </Container>

        <Text font={{ size: 'large', weight: 'bold' }} color={Color.BLACK}>
          {getString('signUp.message.primary')}
        </Text>
        <Text font={{ size: 'medium' }} color={Color.BLACK} margin={{ top: 'xsmall' }}>
          {getString('signUp.message.secondary')}
        </Text>

        <Container margin={{ top: 'xxxlarge' }}>
          <Formik
            initialValues={{ name: '', email: '', password: '' }}
            onSubmit={handleSubmit}
            validationSchema={Yup.object().shape({
              name: Yup.string().trim().required(),
              email: Yup.string().trim().email().required(),
              password: Yup.string().trim().min(6).required()
            })}
          >
            <FormikForm>
              <FormInput.Text
                name="name"
                label={getString('name')}
                placeholder={getString('signUp.form.namePlaceholder')}
              />
              <FormInput.Text
                name="email"
                label={getString('signUp.form.emailLabel')}
                placeholder={getString('signUp.form.emailPlaceholder')}
              />
              <FormInput.Text
                name="password"
                label={getString('password')}
                inputGroup={{ type: 'password' }}
                placeholder={getString('signUp.form.passwordPlaceholder')}
              />
              {loading ? spinner : submitButton}
            </FormikForm>
          </Formik>
        </Container>

        <AuthFooter page={AuthPage.SignUp} />
      </AuthLayout>
    </>
  )
}

export default SignupPage
