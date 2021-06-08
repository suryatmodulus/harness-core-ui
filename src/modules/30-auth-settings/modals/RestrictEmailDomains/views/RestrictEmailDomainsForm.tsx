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
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useUpdateWhitelistedDomains } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

interface Props {
  onSubmit?: () => void
  onCancel: () => void
  whitelistedDomains: string[]
}

interface FormValues {
  domains: string[]
}

const RestrictEmailDomainsForm: React.FC<Props> = ({ onSubmit, onCancel, whitelistedDomains }) => {
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const { accountId } = useParams<AccountPathProps>()
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()

  const { mutate: updateWhitelistedDomains, loading: updatingWhitelistedDomains } = useUpdateWhitelistedDomains({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleSubmit = async (values: FormValues): Promise<void> => {
    try {
      const response = await updateWhitelistedDomains(values.domains)

      /* istanbul ignore else */ if (response) {
        showSuccess(getString('authSettings.WhitelistedDomainsUpdated'), 5000)
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
        {getString('authSettings.allowLoginFromTheseDomains')}
      </Heading>
      <Formik
        formName="restrictEmailDomainsForm"
        initialValues={{
          domains: whitelistedDomains
        }}
        validationSchema={yup.object().shape({
          domains: yup.array().test({
            test: arr => arr.length !== 0,
            message: getString('authSettings.domainNameRequired')
          })
        })}
        onSubmit={values => {
          handleSubmit(values)
        }}
      >
        {() => (
          <FormikForm>
            <FormInput.MultiInput
              name="domains"
              tagsProps={{ placeholder: getString('authSettings.typeAndPressEnterToAddADomain') }}
            />
            <Layout.Horizontal margin={{ top: 'xxxlarge', bottom: 'xlarge' }}>
              <Button
                text={getString('save')}
                intent="primary"
                type="submit"
                margin={{ right: 'small' }}
                disabled={updatingWhitelistedDomains}
              />
              <Button text={getString('cancel')} onClick={onCancel} />
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default RestrictEmailDomainsForm
