import React from 'react'
import * as yup from 'yup'
import { Button, Layout, Color, Formik, FormikForm, FormInput, Container, Heading } from '@wings-software/uicore'
import { Divider } from '@blueprintjs/core'
import { useStrings } from 'framework/exports'
import PasswordChecklist from '@common/components/PasswordChecklist/PasswordChecklist'
import { PASSWORD_CHECKS_RGX, PASSWORD_STRENGTH_POLICY } from '@common/constants/Utils'
import css from './ChangePasswordForm.module.scss'

interface ChangePasswordFormProps {
  hideModal: () => void
}

interface InputIcon {
  isVisible: boolean
  onClick: () => void
}

enum PasswordTypes {
  CURRENT_PASSWORD,
  NEW_PASSWORD,
  CONFIRM_PASSWORD
}

const InputIcon = ({ isVisible, onClick }: InputIcon): React.ReactElement => (
  <Button
    minimal
    icon={isVisible ? 'eye-open' : 'eye-off'}
    iconProps={{ size: 20 }}
    onClick={onClick}
    margin={{ right: 'xsmall' }}
    className={css.iconButton}
  />
)

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ hideModal }) => {
  const { getString } = useStrings()
  const [visiblePasswords, setVisiblePasswords] = React.useState<Array<PasswordTypes>>([])

  const handlePasswordVisibility = (passwordType: PasswordTypes): void => {
    setVisiblePasswords(prevState => {
      if (prevState.includes(passwordType)) {
        return prevState.filter((type: PasswordTypes) => type !== passwordType)
      } else {
        return [...prevState, passwordType]
      }
    })
  }

  const handleSubmit = (): void => {
    // Logic
  }

  return (
    <Layout.Vertical padding={{ left: 'huge', right: 'huge' }}>
      <Heading level={1} color={Color.BLACK} font={{ weight: 'bold' }} margin={{ bottom: 'xxlarge' }}>
        {getString('userProfile.changePassword')}
      </Heading>
      <Formik
        initialValues={{
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }}
        validationSchema={yup.object().shape({
          currentPassword: yup
            .string()
            .required(`${getString('userProfile.currentPassword')} ${getString('userProfile.requiredField')}`),
          newPassword: yup
            .string()
            .matches(PASSWORD_CHECKS_RGX(PASSWORD_STRENGTH_POLICY), getString('userProfile.passwordReqs'))
            .required(`${getString('userProfile.newPassword')} ${getString('userProfile.requiredField')}`),
          confirmPassword: yup
            .string()
            .test('passwords-match', getString('userProfile.passwordMatch'), function (value) {
              return this.parent.newPassword === value
            })
            .required(`${getString('userProfile.confirmPassword')} ${getString('userProfile.requiredField')}`)
        })}
        onSubmit={handleSubmit}
      >
        {({ values }) => (
          <FormikForm>
            <Container width={300}>
              <FormInput.Text
                name="currentPassword"
                label={getString('userProfile.currentPassword')}
                inputGroup={{
                  type: visiblePasswords.includes(PasswordTypes.CURRENT_PASSWORD) ? 'text' : 'password',
                  rightElement: (
                    <InputIcon
                      isVisible={visiblePasswords.includes(PasswordTypes.CURRENT_PASSWORD)}
                      onClick={() => {
                        handlePasswordVisibility(PasswordTypes.CURRENT_PASSWORD)
                      }}
                    />
                  )
                }}
              />
            </Container>
            <Divider className={css.divider} />
            <Layout.Horizontal>
              <Container width={300}>
                <FormInput.Text
                  name="newPassword"
                  label={getString('userProfile.newPassword')}
                  inputGroup={{
                    type: visiblePasswords.includes(PasswordTypes.NEW_PASSWORD) ? 'text' : 'password',
                    rightElement: (
                      <InputIcon
                        isVisible={visiblePasswords.includes(PasswordTypes.NEW_PASSWORD)}
                        onClick={() => {
                          handlePasswordVisibility(PasswordTypes.NEW_PASSWORD)
                        }}
                      />
                    )
                  }}
                />
              </Container>
              <Container padding={{ left: 'xxlarge', top: 'large' }}>
                <PasswordChecklist value={values.newPassword} passwordStrengthPolicy={PASSWORD_STRENGTH_POLICY} />
              </Container>
            </Layout.Horizontal>
            <Container width={300}>
              <FormInput.Text
                name="confirmPassword"
                label={getString('userProfile.confirmPassword')}
                inputGroup={{
                  type: visiblePasswords.includes(PasswordTypes.CONFIRM_PASSWORD) ? 'text' : 'password',
                  rightElement: (
                    <InputIcon
                      isVisible={visiblePasswords.includes(PasswordTypes.CONFIRM_PASSWORD)}
                      onClick={() => {
                        handlePasswordVisibility(PasswordTypes.CONFIRM_PASSWORD)
                      }}
                    />
                  )
                }}
              />
            </Container>
            <Layout.Horizontal margin={{ top: 'xxxlarge', bottom: 'xlarge' }}>
              <Button type="submit" intent="primary" margin={{ right: 'xsmall' }}>
                {getString('userProfile.changePassword')}
              </Button>
              <Button onClick={hideModal}>{getString('cancel')}</Button>
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default ChangePasswordForm
