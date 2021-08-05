import React, { useCallback } from 'react'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { FormikForm, Container, Layout, Text, Button } from '@wings-software/uicore'
import { Formik } from 'formik'
import { useStrings } from 'framework/strings'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useCreateService, CreateServiceQueryParams } from 'services/cd-ng'
import { useToaster } from '@common/exports'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { NameIdDescriptionTags, PageSpinner } from '@common/components'
import { newSeviceInitialData } from './NewServiceForm.constants'
import type { NewServiceFormInterface, NewServiceDataInterface } from './NewServiceForm.types'

export default function NewServiceForm({ onSubmit, onClose }: NewServiceFormInterface): JSX.Element {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { mutate: createService, loading } = useCreateService({
    queryParams: { accountId } as CreateServiceQueryParams
  })

  const handleSubmit = useCallback(async (values: NewServiceDataInterface): Promise<void> => {
    const { name, identifier } = values || {}
    try {
      const res = await createService({
        name: name,
        identifier: identifier,
        orgIdentifier: orgIdentifier,
        projectIdentifier: projectIdentifier
      })

      if (res.status === 'SUCCESS') {
        onSubmit(res.data!)
      }
    } catch (error) {
      clear()
      showError(getErrorMessage(error))
    }
  }, [])

  return (
    <Formik
      initialValues={newSeviceInitialData}
      validationSchema={Yup.object().shape({
        name: NameSchema(),
        identifier: IdentifierSchema()
      })}
      onSubmit={val => {
        handleSubmit(val)
      }}
    >
      {formik => (
        <FormikForm>
          {loading && <PageSpinner message={getString('cv.creatingNewService')} />}
          <Container margin="medium">
            <Text font={{ size: 'medium', weight: 'bold' }} margin={{ bottom: 'large' }}>
              {getString('newService')}
            </Text>
            <NameIdDescriptionTags formikProps={formik} />
            <Layout.Horizontal spacing="medium" margin={{ top: 'xxlarge', bottom: 'large' }}>
              <Button text={getString('submit')} type="submit" intent="primary" />
              <Button text={getString('cancel')} onClick={onClose} />
            </Layout.Horizontal>
          </Container>
        </FormikForm>
      )}
    </Formik>
  )
}
