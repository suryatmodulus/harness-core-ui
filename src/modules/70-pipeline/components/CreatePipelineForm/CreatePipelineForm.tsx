import React from 'react'
import { Text, Layout, Formik, FormikForm as Form, Button, Color } from '@wings-software/uicore'
import { Link } from 'react-router-dom'
import * as Yup from 'yup'
import { NameIdDescriptionTags } from '@common/components'
import type { NgPipeline } from 'services/cd-ng'
import { StringUtils } from '@common/exports'
import { DEFAULT_COLOR } from '@common/constants/Utils'
import { useStrings } from 'framework/exports'

interface CreatePipelineFormProps {
  handleSubmit: (value: NgPipeline) => void
  closeModal?: () => void
}

export const CreatePipelineForm: React.FC<CreatePipelineFormProps> = props => {
  const { getString } = useStrings()
  const { handleSubmit, closeModal } = props
  return (
    <Formik
      initialValues={{
        color: DEFAULT_COLOR,
        identifier: '',
        name: '',
        description: '',
        tags: {}
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().trim().required(getString('createPipeline.pipelineNameRequired')),
        identifier: Yup.string().when('name', {
          is: val => val?.length,
          then: Yup.string()
            .trim()
            .required(getString('validation.identifierRequired'))
            .matches(StringUtils.regexIdentifier, getString('validation.validIdRegex'))
            .notOneOf(StringUtils.illegalIdentifiers)
        })
      })}
      enableReinitialize={true}
      onSubmit={values => {
        handleSubmit(values)
        closeModal?.()
      }}
    >
      {formikProps => {
        return (
          <Form>
            <Text style={{ color: Color.BLACK, paddingBottom: 8, fontWeight: 600, fontSize: 'large' }}>
              {getString('pipeline.createPipeline.setupHeader')}
            </Text>
            <Text style={{ fontSize: 'normal', color: Color.BLACK, paddingBottom: 40 }}>
              {getString('pipeline.createPipeline.setupSubtitle')}
            </Text>
            <NameIdDescriptionTags formikProps={formikProps} />
            <Layout.Horizontal padding={{ top: 'large' }} spacing="medium">
              <Button intent="primary" text={getString('start')} type="submit" />
              <Button
                intent="none"
                text={getString('pipeline.createPipeline.setupLater')}
                type="reset"
                onClick={() => closeModal?.()}
              />
            </Layout.Horizontal>
            <Layout.Horizontal padding={{ top: 'large' }}>
              <Link to={''}>
                <Layout.Horizontal spacing="small">
                  <Text
                    color={Color.BLUE_700}
                    font="normal"
                    rightIcon="chevron-right"
                    rightIconProps={{ color: Color.BLUE_700 }}
                  >
                    {getString('pipeline.createPipeline.learnMore')}
                  </Text>
                </Layout.Horizontal>
              </Link>
            </Layout.Horizontal>
          </Form>
        )
      }}
    </Formik>
  )
}
