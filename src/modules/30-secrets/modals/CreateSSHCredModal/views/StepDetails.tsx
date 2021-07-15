import React from 'react'
import { Button, Text, Color, StepProps, FormikForm, Formik, Container, Layout } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { SecretDTOV2 } from 'services/cd-ng'
import { NameIdDescriptionTags } from '@common/components'
import { StringUtils } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { SSHCredSharedObj } from '../CreateSSHCredWizard'
import css from './StepDetails.module.scss'

export type DetailsForm = Pick<SecretDTOV2, 'name' | 'identifier' | 'description' | 'tags'>

const StepSSHDetails: React.FC<StepProps<SSHCredSharedObj> & SSHCredSharedObj> = ({
  prevStepData,
  nextStep,
  detailsData,
  authData,
  isEdit
}) => {
  const { getString } = useStrings()
  return (
    <Container padding="small" height={500}>
      <Text margin={{ bottom: 'xlarge' }} font={{ size: 'medium' }} color={Color.BLACK}>
        {getString('secrets.createSSHCredWizard.titleDetails')}
      </Text>
      <Formik<DetailsForm>
        onSubmit={values => {
          nextStep?.({ detailsData: values, authData, isEdit: isEdit, ...prevStepData })
        }}
        formName="sshStepDetailsForm"
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required(getString('secrets.createSSHCredWizard.validName')),
          identifier: Yup.string().when('name', {
            is: val => val?.length,
            then: Yup.string()
              .trim()
              .required(getString('secrets.createSSHCredWizard.validId'))
              .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('secrets.createSSHCredWizard.validIdRegex'))
              .notOneOf(StringUtils.illegalIdentifiers)
          })
        })}
        initialValues={{
          name: '',
          identifier: '',
          description: '',
          tags: {},
          ...(prevStepData ? prevStepData.detailsData : detailsData)
        }}
      >
        {formikProps => {
          return (
            <FormikForm>
              <Container className={css.formData}>
                <NameIdDescriptionTags
                  formikProps={formikProps}
                  identifierProps={{
                    inputName: 'name',
                    isIdentifierEditable: isEdit || prevStepData?.isEdit ? false : true
                  }}
                />
              </Container>
              <Layout.Horizontal>
                <Button type="submit" intent="primary" text={getString('continue')} />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export default StepSSHDetails
