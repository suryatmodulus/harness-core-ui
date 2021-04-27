import React from 'react'
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
import type { RestResponseUserInfo } from 'services/portal'

import AuthFooter, { AuthPage } from '@common/components/AuthLayout/AuthFooter/AuthFooter'
import { useStrings } from 'framework/strings'
import type { Module } from '@common/interfaces/RouteInterfaces'

interface SignupForm {
  email: string
  password: string
}

const setToken = async (response: RestResponseUserInfo): Promise<void> => {
  const { token, defaultAccountId, uuid } = response.resource
  AppStorage.set('token', token)
  AppStorage.set('acctId', defaultAccountId)
  AppStorage.set('uuid', uuid)
  AppStorage.set('lastTokenSetTime', +new Date())
}

const SignupPage: React.FC = () => {
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { module } = useQueryParams<{ module?: Module }>()
  const { mutate: getUserInfo, loading } = useSignupUser({})
  const history = useHistory()

  const HarnessLogo = HarnessIcons['harness-logo-black']

  const handleSignup = async (data: SignupForm): Promise<void> => {
    const { email, password } = data

    const dataToSubmit: SignupUserRequestBody = {
      email,
      password
    }

    try {
      const userInfoResponse = await getUserInfo(dataToSubmit)
      const accountId = userInfoResponse.resource.defaultAccountId
      await setToken(userInfoResponse)
      if (module) {
        history.push(routes.toModuleTrialHome({ module, accountId }))
      } else {
        history.push(
          routes.toPurpose({
            accountId
          })
        )
      }
    } catch (error) {
      showError(error.message)
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
              email: Yup.string().email().required(),
              password: Yup.string().min(8).required()
            })}
          >
            <FormikForm>
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
