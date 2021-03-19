import React from 'react'
import { Link } from 'react-router-dom'
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
import { URLS } from '@common/constants/OAuthProviders'
import { useToaster } from '@common/components'
import { UserInviteRequestBody, useTrialSignup } from 'services/portal'
import AuthLayout from '@common/components/AuthLayout/AuthLayout'

import AuthFooter, { AuthPage } from '@common/components/AuthLayout/AuthFooter/AuthFooter'
import { useStrings } from 'framework/exports'

interface SignupForm {
  name: string
  email: string
  company: string
  password: string
}

const SignupPage: React.FC = () => {
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { mutate: createTrialAccount, loading: loadingTrialSignup } = useTrialSignup({})

  const HarnessLogo = HarnessIcons['harness-logo-black']

  const handleSignup = async (data: SignupForm): Promise<void> => {
    const { name, email, company: companyName, password } = data

    const dataToSubmit: UserInviteRequestBody = {
      uuid: '',
      appId: '',
      lastUpdatedAt: 0,
      name,
      email,
      companyName,
      password: password.split('')
    }

    try {
      await createTrialAccount(dataToSubmit)

      // Redirect to free-trial page
      // This will be updated in the future
      window.location.href = URLS.FREE_TRIAL
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
            initialValues={{ name: '', email: '', company: '', password: '' }}
            onSubmit={handleSubmit}
            validationSchema={Yup.object().shape({
              name: Yup.string().trim().required(),
              email: Yup.string().trim().email().required(),
              company: Yup.string().trim().required(),
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
                name="company"
                label={getString('signUp.form.companyLabel')}
                placeholder={getString('signUp.form.companyPlaceholder')}
              />
              <FormInput.Text
                name="password"
                label={getString('password')}
                inputGroup={{ type: 'password' }}
                placeholder={getString('signUp.form.passwordPlaceholder')}
              />
              {loadingTrialSignup ? spinner : submitButton}
            </FormikForm>
          </Formik>
        </Container>

        <AuthFooter page={AuthPage.SignUp} />
      </AuthLayout>
    </>
  )
}

export default SignupPage
