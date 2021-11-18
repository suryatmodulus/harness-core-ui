import React from 'react'
import { Formik, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'

import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { ContinousVerificationData } from '../../types'
import type { ContinousVerificationWidgetProps } from './types'
import { ContinousVerificationWidgetSections } from './components/ContinousVerificationWidgetSections/ContinousVerificationWidgetSections'
import { MONITORED_SERVICE_EXPRESSION } from './components/ContinousVerificationWidgetSections/components/MonitoredService/MonitoredService.constants'

/**
 * Spec
 * https://harness.atlassian.net/wiki/spaces/LEARNING/pages/1762656555/Change+intelligence+-+CDNG+integration
 */

export function ContinousVerificationWidget(
  { initialValues, onUpdate, isNewStep, stepViewType, onChange, allowableTypes }: ContinousVerificationWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const values = { ...initialValues, spec: { ...initialValues.spec } }
  const { getString } = useStrings()
  const defaultCVSchema = Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    spec: Yup.object().shape({
      type: Yup.string().required(getString('connectors.cdng.validations.verificationTypeRequired')),
      monitoredServiceRef: Yup.string().required(getString('connectors.cdng.validations.monitoringServiceRequired')),
      healthSources: Yup.string().when(['monitoredServiceRef'], (monitoredServiceRef: string) => {
        if (monitoredServiceRef !== RUNTIME_INPUT_VALUE && monitoredServiceRef !== MONITORED_SERVICE_EXPRESSION) {
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
    })
  })

  return (
    <Formik<ContinousVerificationData>
      onSubmit={submit => {
        onUpdate?.(submit)
      }}
      validate={data => {
        onChange?.(data)
      }}
      formName="cvData"
      initialValues={values}
      validationSchema={defaultCVSchema}
    >
      {(formik: FormikProps<ContinousVerificationData>) => {
        setFormikRef(formikRef, formik)
        return (
          <ContinousVerificationWidgetSections
            formik={formik}
            isNewStep={isNewStep}
            stepViewType={stepViewType}
            allowableTypes={allowableTypes}
          />
        )
      }}
    </Formik>
  )
}

export const ContinousVerificationWidgetWithRef = React.forwardRef(ContinousVerificationWidget)
