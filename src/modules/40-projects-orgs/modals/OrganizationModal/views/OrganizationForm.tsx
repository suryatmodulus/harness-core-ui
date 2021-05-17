import React from 'react'
import * as Yup from 'yup'
import {
  Button,
  Color,
  Container,
  Formik,
  FormikForm as Form,
  Heading,
  Layout,
  ModalErrorHandlerBinding,
  ModalErrorHandler
} from '@wings-software/uicore'
import { OrganizationCard } from '@projects-orgs/components/OrganizationCard/OrganizationCard'
import type { Organization } from 'services/cd-ng'
import { NameIdDescriptionTags } from '@common/components'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import css from './Steps.module.scss'

interface OrganizationFormData {
  data?: Organization
  title: string
  submitTitle: string
  disableSubmit?: boolean
  disablePreview?: boolean
  enableEdit: boolean
  onComplete: (organization: Organization) => Promise<void>
  setModalErrorHandler: (modalErrorHandler: ModalErrorHandlerBinding) => void
}

const OrganizationForm: React.FC<OrganizationFormData> = ({
  data,
  title,
  setModalErrorHandler,
  onComplete,
  submitTitle,
  disableSubmit,
  disablePreview,
  enableEdit
}) => {
  return (
    <Formik
      initialValues={{
        identifier: '',
        name: '',
        description: '',
        tags: {},
        ...data
      }}
      enableReinitialize={true}
      validationSchema={Yup.object().shape({
        name: NameSchema(),
        identifier: IdentifierSchema()
      })}
      onSubmit={(values: Organization) => {
        onComplete(values)
      }}
    >
      {formikProps => (
        <Form>
          <ModalErrorHandler bind={setModalErrorHandler} />
          <Layout.Horizontal>
            <Layout.Vertical width={disablePreview ? '100%' : '50%'} padding="xxlarge">
              <Container style={{ minHeight: '450px' }}>
                <Heading level={2} color={Color.GREY_800} margin={{ bottom: 'xxlarge' }}>
                  {title}
                </Heading>
                <NameIdDescriptionTags
                  formikProps={formikProps}
                  identifierProps={{ isIdentifierEditable: enableEdit }}
                />
              </Container>
              <Layout.Horizontal spacing="xsmall">
                <Button type="submit" intent="primary" text={submitTitle} disabled={disableSubmit} />
              </Layout.Horizontal>
            </Layout.Vertical>
            {disablePreview ? null : (
              <Container width="50%" flex={{ align: 'center-center' }} className={css.preview}>
                <OrganizationCard data={{ organizationResponse: { organization: formikProps.values } }} isPreview />
              </Container>
            )}
          </Layout.Horizontal>
        </Form>
      )}
    </Formik>
  )
}

export default OrganizationForm
