import React from 'react'
import * as Yup from 'yup'
import { Button, Color, Container, Formik, FormikForm as Form, Heading, Layout } from '@wings-software/uicore'
import { NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import type { dataObj } from '../CreateDelegateConfigWizard'

import css from './DelegateConfigSteps.module.scss'

interface DelegateConfigOverviewStepProps {
  name: string
  onComplete?: (data: dataObj) => Promise<void>
  nextStep?: (data: dataObj) => void
  closeModal?: () => void
  onSuccess?: () => void
  prevStepData?: dataObj
}

const DelegateConfigOverviewStep: React.FC<DelegateConfigOverviewStepProps> = ({ nextStep, prevStepData }) => {
  const { getString } = useStrings()
  return (
    <Formik
      initialValues={{
        identifier: '',
        name: prevStepData?.name || '',
        description: prevStepData?.description || '',
        tags: prevStepData?.tags || {}
      }}
      formName="delegateConfigOverviewForm"
      enableReinitialize={true}
      validationSchema={Yup.object().shape({
        name: NameSchema()
      })}
      onSubmit={(values: dataObj) => {
        nextStep?.({ ...prevStepData, ...values })
      }}
    >
      {formikProps => (
        <Form>
          <Layout.Vertical padding="xxlarge" className={css.stepContainer}>
            <Container style={{ minHeight: '350px' }}>
              <Heading level={2} color={Color.GREY_800} margin={{ bottom: 'xxlarge' }}>
                {getString('delegates.newDelegateConfigWizard.overviewTitle')}
              </Heading>
              <NameIdDescriptionTags formikProps={formikProps} />
            </Container>
            <Layout.Horizontal spacing="xsmall">
              <Button type="submit" intent="primary" text={getString('saveAndContinue')} />
            </Layout.Horizontal>
          </Layout.Vertical>
        </Form>
      )}
    </Formik>
  )
}

export default DelegateConfigOverviewStep
