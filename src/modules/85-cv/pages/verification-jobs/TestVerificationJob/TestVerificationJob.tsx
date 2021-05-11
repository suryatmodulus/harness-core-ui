import React from 'react'
import { Container, Formik, FormikForm, Layout, Text, Color } from '@wings-software/uicore'

import * as Yup from 'yup'

import { useStrings } from 'framework/strings'

import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'

import { CVSelectionCard } from '@cv/components/CVSelectionCard/CVSelectionCard'
import { VerificationJobType } from '@cv/constants'
import {
  ServiceName,
  VerificationSensitivity,
  EnvironmentName,
  Duration,
  BaselineSelect
} from '../VerificationJobForms/VerificationJobFields'
import { useVerificationJobFormSubmit } from '../VerificationJobForms/VerificationJobFormCommons'
interface VerificationJobsDetailsProps {
  stepData: any
  onPrevious: () => void
  onNext: (data: any) => void
}
const TestVerificationJob: React.FC<VerificationJobsDetailsProps> = props => {
  const { getString } = useStrings()
  const { onSubmit, loading } = useVerificationJobFormSubmit({ onSuccess: props.onNext })

  return (
    <Container style={{ position: 'relative', top: 80 }}>
      <Formik
        initialValues={{ ...props.stepData }}
        validationSchema={Yup.object().shape({
          service: Yup.string().trim().required(getString('cv.verificationJobs.validation.service')),
          baseline: Yup.string().trim().required(getString('cv.verificationJobs.validation.baseline')),
          environment: Yup.string().required(getString('cv.verificationJobs.validation.environment')),
          duration: Yup.string().required(getString('cv.verificationJobs.validation.duration')),
          sensitivity: Yup.string().required(getString('cv.verificationJobs.validation.sensitivity'))
        })}
        onSubmit={data => {
          onSubmit({ ...props.stepData, ...data })
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <Layout.Vertical width="50%" style={{ margin: 'auto' }}>
                <Text font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800} margin={{ bottom: 'small' }}>
                  {getString('cv.verificationJobs.configure.heading')}
                </Text>
                <CVSelectionCard
                  isSelected={true}
                  iconProps={{
                    name: 'lab-test',
                    size: 20
                  }}
                  onCardSelect={() => {
                    formik.setFieldValue('type', VerificationJobType.TEST)
                  }}
                  cardLabel={getString('test')}
                />
                <Text margin={{ bottom: 'large' }} padding={{ top: 'xlarge' }}>
                  {getString('cv.verificationJobs.configure.preDepText')}
                </Text>
                <Layout.Horizontal>
                  <Container margin={{ right: 'xlarge' }} width={'300px'}>
                    <ServiceName />
                    <EnvironmentName />
                    <VerificationSensitivity />
                  </Container>
                  <Container width={'300px'}>
                    <Duration />

                    <BaselineSelect />
                  </Container>
                </Layout.Horizontal>

                <SubmitAndPreviousButtons
                  onPreviousClick={props.onPrevious}
                  nextButtonProps={{ text: getString('submit'), loading }}
                />
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export default TestVerificationJob
