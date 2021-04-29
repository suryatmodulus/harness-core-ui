import React from 'react'
import * as yup from 'yup'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Heading,
  Color,
  Formik,
  FormikForm,
  FormInput,
  Button,
  ModalErrorHandler,
  ModalErrorHandlerBinding
} from '@wings-software/uicore'
import { useToaster } from '@common/components'
import type { LoginSettings, PasswordExpirationPolicy } from 'services/cd-ng'
import { usePutLoginSettings } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'

interface Props {
  onSubmit?: () => void
  onCancel: () => void
  loginSettings: LoginSettings
  editing: boolean
}

interface FormValues {
  daysBeforePasswordExpire: number
  daysBeforeUserNotified: number
}

const PasswordExpirationForm: React.FC<Props> = ({ onSubmit, onCancel, loginSettings, editing }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess } = useToaster()
  const passwordExpirationSettings = loginSettings.passwordExpirationPolicy
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()

  const { mutate: updateLoginSettings, loading: updatingLoginSettings } = usePutLoginSettings({
    loginSettingsId: loginSettings.uuid,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleSubmit = async (values: FormValues): Promise<void> => {
    const passwordExpirationPolicy: PasswordExpirationPolicy = {
      enabled: editing ? passwordExpirationSettings.enabled : /* istanbul ignore next */ true,
      daysBeforePasswordExpires: values.daysBeforePasswordExpire,
      daysBeforeUserNotifiedOfPasswordExpiration: values.daysBeforeUserNotified
    }

    try {
      const response = await updateLoginSettings({
        ...loginSettings,
        passwordExpirationPolicy
      })
      /* istanbul ignore else */ if (response) {
        showSuccess(
          getString(
            editing ? 'common.authSettings.passwordExpirationUpdated' : 'common.authSettings.passwordExpirationEnabled'
          )
        )
        onSubmit?.()
      }
    } catch (e) {
      /* istanbul ignore next */ modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }

  return (
    <Layout.Vertical padding={{ left: 'huge', right: 'huge' }}>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Heading level={1} color={Color.BLACK} font={{ weight: 'bold' }} margin={{ bottom: 'xxlarge' }}>
        {getString('common.authSettings.passwordExpiration')}
      </Heading>
      <Formik
        initialValues={{
          daysBeforePasswordExpire:
            passwordExpirationSettings.daysBeforePasswordExpires || /* istanbul ignore next */ 30,
          daysBeforeUserNotified:
            passwordExpirationSettings.daysBeforeUserNotifiedOfPasswordExpiration || /* istanbul ignore next */ 3
        }}
        validationSchema={yup.object().shape({
          daysBeforePasswordExpire: yup
            .number()
            .typeError(getString('common.validation.valueMustBeANumber'))
            .min(1, getString('common.validation.valueMustBeGreaterThanOrEqualToN', { n: 1 }))
            .required(getString('validation.thisIsARequiredField')),
          daysBeforeUserNotified: yup
            .number()
            .typeError(getString('common.validation.valueMustBeANumber'))
            .min(1, getString('common.validation.valueMustBeGreaterThanOrEqualToN', { n: 1 }))
            .required(getString('validation.thisIsARequiredField'))
        })}
        onSubmit={values => {
          handleSubmit(values)
        }}
      >
        {() => (
          <FormikForm>
            <Layout.Vertical spacing="xlarge">
              <FormInput.Text
                name="daysBeforePasswordExpire"
                label={getString('common.authSettings.daysBeforePasswordExpires')}
                inputGroup={{
                  type: 'number'
                }}
              />
              <FormInput.Text
                name="daysBeforeUserNotified"
                label={getString('common.authSettings.daysBeforeUserNotified')}
                inputGroup={{
                  type: 'number'
                }}
              />
            </Layout.Vertical>
            <Layout.Horizontal margin={{ top: 'xxxlarge', bottom: 'xlarge' }}>
              <Button type="submit" intent="primary" margin={{ right: 'xsmall' }} loading={updatingLoginSettings}>
                {getString('save')}
              </Button>
              <Button onClick={onCancel}>{getString('cancel')}</Button>
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default PasswordExpirationForm
