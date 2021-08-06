import React from 'react'
import * as Yup from 'yup'
import { omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Layout, Container, Button, Formik } from '@wings-software/uicore'
import { NameIdDescriptionTags, PageSpinner } from '@common/components'
import { useToaster } from '@common/exports'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import { useStrings } from 'framework/strings'
import { useCreateServicesV2, useUpsertServiceV2, ServiceRequestDTO } from 'services/cd-ng'
import type { NewEditServiceModalProps } from './NewEditServiceModal.types'

export const NewEditServiceModal: React.FC<NewEditServiceModalProps> = ({
  isEdit,
  data,
  isService,
  formik,
  onCreateOrUpdate,
  closeModal
}): JSX.Element => {
  const { getString } = useStrings()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
    accountId: string
  }>()

  const { loading: createLoading, mutate: createService } = useCreateServicesV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { loading: updateLoading, mutate: updateService } = useUpsertServiceV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])
  const { showSuccess, showError, clear } = useToaster()

  const onSubmit = React.useCallback(
    async (values: ServiceRequestDTO) => {
      try {
        if (isEdit && !isService) {
          const response = await updateService({
            ...omit(values, 'accountId', 'deleted'),
            orgIdentifier,
            projectIdentifier
          })
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('common.serviceCreated'))
            formik?.setFieldValue('serviceRef', values.identifier)
            onCreateOrUpdate(values)
          }
        } else {
          const response = await createService([{ ...values, orgIdentifier, projectIdentifier }])
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('common.serviceCreated'))
            formik?.setFieldValue('serviceRef', values.identifier)
            onCreateOrUpdate(values)
          }
        }
      } catch (e) {
        showError(e?.data?.message || e?.message || getString('commonError'))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onCreateOrUpdate, orgIdentifier, projectIdentifier, isEdit, isService, formik]
  )

  if (createLoading || updateLoading) {
    return <PageSpinner />
  }

  return (
    <Formik<ServiceRequestDTO>
      initialValues={data}
      formName="deployService"
      enableReinitialize={false}
      onSubmit={values => {
        onSubmit(values)
      }}
      validationSchema={Yup.object().shape({
        name: NameSchema({ requiredErrorMsg: getString?.('fieldRequired', { field: 'Service' }) }),
        identifier: IdentifierSchema()
      })}
    >
      {formikProps => (
        <Layout.Vertical
          onKeyDown={e => {
            if (e.key === 'Enter') {
              formikProps.handleSubmit()
            }
          }}
        >
          <NameIdDescriptionTags
            formikProps={formikProps}
            identifierProps={{
              inputLabel: getString('name'),
              inputGroupProps: {
                inputGroup: {
                  inputRef: ref => (inputRef.current = ref)
                }
              },
              isIdentifierEditable: !isEdit
            }}
          />
          <Container padding={{ top: 'xlarge' }}>
            <Button
              data-id="service-save"
              onClick={() => formikProps.submitForm()}
              intent="primary"
              text={getString('save')}
            />
            &nbsp; &nbsp;
            <Button text={getString('cancel')} onClick={closeModal} />
          </Container>
        </Layout.Vertical>
      )}
    </Formik>
  )
}
