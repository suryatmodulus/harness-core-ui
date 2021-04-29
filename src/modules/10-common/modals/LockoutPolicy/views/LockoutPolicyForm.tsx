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
  Select,
  Text,
  ModalErrorHandler,
  ModalErrorHandlerBinding
} from '@wings-software/uicore'
import { useToaster } from '@common/components'
import type { LoginSettings, UserLockoutPolicy } from 'services/cd-ng'
import { usePutLoginSettings } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'

interface Props {
  onSubmit?: () => void
  onCancel: () => void
  loginSettings: LoginSettings
  editing: boolean
}

const LockoutPolicyForm: React.FC<Props> = ({ onSubmit, onCancel, loginSettings, editing }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()
  const userLockoutSettings = loginSettings.userLockoutPolicy

  const { mutate: updateLoginSettings, loading: updatingLoginSettings } = usePutLoginSettings({
    loginSettingsId: loginSettings.uuid,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleSubmit = async (values: UserLockoutPolicy): Promise<void> => {
    const userLockoutPolicy: UserLockoutPolicy = {
      ...values,
      enableLockoutPolicy: editing ? userLockoutSettings.enableLockoutPolicy : true
    }

    try {
      const response = await updateLoginSettings({
        ...loginSettings,
        userLockoutPolicy
      })

      /* istanbul ignore else */ if (response) {
        showSuccess(
          getString(editing ? 'common.authSettings.lockoutPolicyUpdated' : 'common.authSettings.lockoutPolicyEnabled'),
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
        {getString('common.authSettings.lockoutPolicy')}
      </Heading>
      <Formik
        initialValues={{
          numberOfFailedAttemptsBeforeLockout:
            userLockoutSettings.numberOfFailedAttemptsBeforeLockout || /* istanbul ignore next */ 1,
          lockOutPeriod: userLockoutSettings.lockOutPeriod || /* istanbul ignore next */ 1,
          notifyUser: !!userLockoutSettings.notifyUser,
          userGroupsToNotify: []
        }}
        validationSchema={yup.object().shape({
          numberOfFailedAttemptsBeforeLockout: yup
            .number()
            .typeError(getString('common.validation.valueMustBeANumber'))
            .min(1, getString('common.validation.valueMustBeGreaterThanOrEqualToN', { n: 1 }))
            .required(getString('validation.thisIsARequiredField')),
          lockOutPeriod: yup
            .number()
            .typeError(getString('common.validation.valueMustBeANumber'))
            .min(1, getString('common.validation.valueMustBeGreaterThanOrEqualToN', { n: 1 }))
            .required(getString('validation.thisIsARequiredField'))
        })}
        onSubmit={values => {
          handleSubmit(values)
        }}
      >
        {({ values, setFieldValue }) => (
          <FormikForm>
            <Layout.Vertical spacing="xlarge">
              <FormInput.Text
                name="numberOfFailedAttemptsBeforeLockout"
                label={getString('common.authSettings.failedLoginsBeforeLocked')}
                inputGroup={{
                  type: 'number'
                }}
              />
              <FormInput.Text
                name="lockOutPeriod"
                label={getString('common.authSettings.lockoutDuration')}
                inputGroup={{
                  type: 'number'
                }}
              />
            </Layout.Vertical>
            <Layout.Vertical padding={{ left: 'xxlarge', top: 'large', bottom: 'xxlarge' }}>
              <Checkbox
                label={getString('common.authSettings.notifyUsersWhenTheyLocked')}
                checked={values.notifyUser}
                onChange={e => setFieldValue('notifyUser', e.currentTarget.checked)}
              />
            </Layout.Vertical>
            <Text color={Color.GREY_500} padding={{ top: 'xsmall', bottom: 'xsmall' }}>
              {getString('common.authSettings.notifyUsersWHenUserLocked')}
            </Text>
            <Select
              name="userGroupsToNotify"
              items={[]}
              inputProps={{ placeholder: getString('common.authSettings.selectUserGroup') }}
            />
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

export default LockoutPolicyForm
