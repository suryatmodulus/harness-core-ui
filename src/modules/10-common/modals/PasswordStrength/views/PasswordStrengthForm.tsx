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
  Checkbox,
  Button,
  ModalErrorHandler,
  ModalErrorHandlerBinding
} from '@wings-software/uicore'
import { useToaster } from '@common/components'
import type { LoginSettings, PasswordStrengthPolicy } from 'services/cd-ng'
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
  minNumberOfCharacters: number
  atLeastOneUppercase: boolean
  atLeastOneLowercase: boolean
  atLeastOneDigit: boolean
  atLeastOneSpecialChar: boolean
}

const PasswordStrengthForm: React.FC<Props> = ({ onSubmit, onCancel, loginSettings, editing }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess } = useToaster()
  const passwordStrengthSettings = loginSettings.passwordStrengthPolicy
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()

  const { mutate: updateLoginSettings, loading: updatingLoginSettings } = usePutLoginSettings({
    loginSettingsId: loginSettings.uuid,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleSubmit = async (values: FormValues): Promise<void> => {
    const passwordStrengthPolicy: PasswordStrengthPolicy = {
      enabled: editing ? passwordStrengthSettings.enabled : /* istanbul ignore next */ true,
      minNumberOfCharacters: values.minNumberOfCharacters,
      minNumberOfUppercaseCharacters: Number(values.atLeastOneUppercase),
      minNumberOfLowercaseCharacters: Number(values.atLeastOneLowercase),
      minNumberOfDigits: Number(values.atLeastOneDigit),
      minNumberOfSpecialCharacters: Number(values.atLeastOneSpecialChar)
    }

    try {
      const response = await updateLoginSettings({
        ...loginSettings,
        passwordStrengthPolicy
      })
      /* istanbul ignore else */ if (response) {
        showSuccess(
          getString(
            editing ? 'common.authSettings.passwordStrengthUpdated' : 'common.authSettings.passwordStrengthEnabled'
          ),
          5000
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
        {getString('common.authSettings.passwordStrength')}
      </Heading>
      <Formik
        initialValues={{
          minNumberOfCharacters: passwordStrengthSettings?.minNumberOfCharacters || /* istanbul ignore next */ 12,
          atLeastOneUppercase: !!passwordStrengthSettings?.minNumberOfUppercaseCharacters,
          atLeastOneLowercase: !!passwordStrengthSettings?.minNumberOfLowercaseCharacters,
          atLeastOneDigit: !!passwordStrengthSettings?.minNumberOfDigits,
          atLeastOneSpecialChar: !!passwordStrengthSettings?.minNumberOfSpecialCharacters
        }}
        validationSchema={yup.object().shape({
          minNumberOfCharacters: yup
            .number()
            .typeError(getString('common.validation.valueMustBeANumber'))
            .min(8, getString('common.validation.valueMustBeGreaterThanOrEqualToN', { n: 8 }))
            .max(64, getString('common.validation.valueMustBeLessThanOrEqualTo64'))
            .required(getString('validation.minLengthRequired'))
        })}
        onSubmit={values => {
          handleSubmit(values)
        }}
      >
        {({ values, setFieldValue }) => (
          <FormikForm>
            <FormInput.Text
              name="minNumberOfCharacters"
              label={getString('common.authSettings.minLength')}
              inputGroup={{
                type: 'number'
              }}
            />
            <Layout.Vertical spacing="medium" padding={{ left: 'xxlarge', top: 'xxlarge' }}>
              <Checkbox
                label={getString('common.authSettings.haveOneUppercase')}
                checked={values.atLeastOneUppercase}
                onChange={e => setFieldValue('atLeastOneUppercase', e.currentTarget.checked)}
              />
              <Checkbox
                label={getString('common.authSettings.haveOneLowercase')}
                checked={values.atLeastOneLowercase}
                onChange={e => setFieldValue('atLeastOneLowercase', e.currentTarget.checked)}
              />
              <Checkbox
                label={getString('common.authSettings.haveOneDigit')}
                checked={values.atLeastOneDigit}
                onChange={e => setFieldValue('atLeastOneDigit', e.currentTarget.checked)}
              />
              <Checkbox
                label={getString('common.authSettings.haveOneSpecialChar')}
                checked={values.atLeastOneSpecialChar}
                onChange={e => setFieldValue('atLeastOneSpecialChar', e.currentTarget.checked)}
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

export default PasswordStrengthForm
