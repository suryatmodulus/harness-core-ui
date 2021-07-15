import React from 'react'
import { Formik, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'

import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import type { ContinousVerificationData } from '../../types'
import type { ContinousVerificationWidgetProps } from './types'
import { ContinousVerificationWidgetSections } from './components/ContinousVerificationWidgetSections/ContinousVerificationWidgetSections'

/**
 * Spec
 * https://harness.atlassian.net/wiki/spaces/LEARNING/pages/1762656555/Change+intelligence+-+CDNG+integration
 */

export function ContinousVerificationWidget(
  { initialValues, onUpdate, isNewStep }: ContinousVerificationWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const values = { ...initialValues, spec: { ...initialValues.spec } }
  const { getString } = useStrings()
  const defaultCVSchema = Yup.object().shape({
    name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') }),
    spec: Yup.object().shape({
      type: Yup.string().required(getString('connectors.cdng.validations.verificationTypeRequired')),
      monitoredServiceRef: Yup.string().required(getString('connectors.cdng.validations.monitoringServiceRequired')),
      healthSources: Yup.string().when(['monitoredServiceRef'], (monitoredServiceRef: string) => {
        if (monitoredServiceRef !== RUNTIME_INPUT_VALUE) {
          return Yup.array().min(1, getString('connectors.cdng.validations.healthSourceRequired'))
        }
      }),
      spec: Yup.object().shape({
        duration: Yup.mixed().test(
          'duration',
          getString('connectors.cdng.validations.durationRequired'),
          value => value !== ''
        ),
        sensitivity: Yup.mixed().test(
          'sensitivity',
          getString('connectors.cdng.validations.sensitivityRequired'),
          value => value !== ''
        ),
        deploymentTag: Yup.string().required(getString('connectors.cdng.validations.deploymentTagRequired'))
      })
    }),
    identifier: IdentifierSchema()
  })

  return (
    <Formik<ContinousVerificationData>
      onSubmit={submit => {
        onUpdate?.(submit)
      }}
      formName="cvData"
      initialValues={values}
      validationSchema={defaultCVSchema}
    >
      {(formik: FormikProps<ContinousVerificationData>) => {
        setFormikRef(formikRef, formik)
        return <ContinousVerificationWidgetSections formik={formik} isNewStep={isNewStep} />
      }}
    </Formik>
  )
}

export const ContinousVerificationWidgetWithRef = React.forwardRef(ContinousVerificationWidget)
