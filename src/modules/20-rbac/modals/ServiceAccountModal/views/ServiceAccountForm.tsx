import React, { useState } from 'react'
import {
  Button,
  Color,
  Container,
  Formik,
  FormikForm as Form,
  FormInput,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  Text,
  TextInput
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { useToaster } from '@common/components'
import { DescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import { ServiceAccountDTO, useCreateServiceAccount, useUpdateServiceAccount } from 'services/cd-ng'
import css from '@rbac/modals/ServiceAccountModal/useServiceAccountModal.module.scss'

interface ServiceAccountModalData {
  data?: ServiceAccountDTO
  isEdit?: boolean
  onSubmit?: (serviceAccount: ServiceAccountDTO) => void
}

const ServiceAccountForm: React.FC<ServiceAccountModalData> = props => {
  const { data: serviceAccountData, onSubmit, isEdit } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: createServiceAccount, loading: saving } = useCreateServiceAccount({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { mutate: editServiceAccount, loading: updating } = useUpdateServiceAccount({
    identifier: serviceAccountData?.identifier || '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const handleSubmit = async (values: ServiceAccountDTO): Promise<void> => {
    const dataToSubmit = { ...values, email: values['identifier'].concat('@service.harness.io') }
    try {
      if (isEdit) {
        const updated = await editServiceAccount(dataToSubmit)
        /* istanbul ignore else */ if (updated) {
          showSuccess(getString('rbac.serviceAccounts.form.editSuccess', { name: values.name }))
          onSubmit?.(values)
        }
      } else {
        const created = await createServiceAccount(dataToSubmit)
        /* istanbul ignore else */ if (created) {
          showSuccess(getString('rbac.serviceAccounts.form.createSuccess', { name: values.name }))
          onSubmit?.(values)
        }
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }
  return (
    <Layout.Vertical padding={{ bottom: 'xxxlarge', right: 'xxxlarge', left: 'xxxlarge' }}>
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {isEdit
            ? getString('rbac.serviceAccounts.form.editServiceAccount')
            : getString('rbac.serviceAccounts.newServiceAccount')}
        </Text>
        <Formik
          initialValues={{
            identifier: '',
            name: '',
            description: '',
            email: '',
            tags: {},
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            ...serviceAccountData
          }}
          formName="serviceAccountForm"
          validationSchema={Yup.object().shape({
            name: NameSchema(),
            identifier: IdentifierSchema()
          })}
          onSubmit={values => {
            modalErrorHandler?.hide()
            handleSubmit(values)
          }}
        >
          {formikProps => {
            return (
              <Form>
                <Container className={css.form}>
                  <ModalErrorHandler bind={setModalErrorHandler} />
                  <FormInput.InputWithIdentifier isIdentifierEditable={!isEdit} />
                  <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
                    <Layout.Vertical>
                      <Text>{getString('email')}</Text>
                      <TextInput disabled value={formikProps.values.identifier} />
                    </Layout.Vertical>
                    <Text margin={{ top: 'xsmall' }}>{getString('rbac.serviceAccounts.email')}</Text>
                  </Layout.Horizontal>
                  <DescriptionTags formikProps={formikProps} />
                </Container>
                <Layout.Horizontal>
                  <Button intent="primary" text={getString('save')} type="submit" disabled={saving || updating} />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default ServiceAccountForm
