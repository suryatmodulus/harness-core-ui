import React from 'react'
import { Formik, Accordion } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/exports'
import type { StepViewType } from '@pipeline/exports'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { IdentifierValidation } from '@pipeline/components/PipelineStudio/PipelineUtils'
import ResponseMapping from './ResponseMapping'
import type { HttpStepData, HttpStepFormData } from './types'
import HttpStepBase from './HttpStepBase'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

/**
 * Spec
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/1160446867/Http+Step
 */

export interface HttpStepWidgetProps {
  initialValues: HttpStepFormData
  isNewStep?: boolean
  isDisabled?: boolean
  onUpdate?: (data: HttpStepFormData) => void
  stepViewType?: StepViewType
  readonly: boolean
}

export function HttpStepWidget(
  props: HttpStepWidgetProps,
  formikRef: StepFormikFowardRef<HttpStepData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, isDisabled } = props
  const { getString } = useStrings()

  return (
    <Formik<HttpStepFormData>
      onSubmit={values => {
        onUpdate?.(values)
      }}
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          url: Yup.string().required(getString('validation.UrlRequired')),
          method: Yup.mixed().required(getString('pipelineSteps.methodIsRequired')),
          headers: Yup.array().of(
            Yup.object().shape({
              key: Yup.string().required(getString('validation.keyRequired')),
              value: Yup.string().required(getString('validation.valueRequired'))
            })
          ),
          outputVariables: Yup.array().of(
            Yup.object().shape({
              name: Yup.string().required(getString('validation.nameRequired')),
              value: Yup.string().required(getString('validation.valueRequired'))
            })
          )
        }),
        ...IdentifierValidation()
      })}
    >
      {(formik: FormikProps<HttpStepFormData>) => {
        // this is required
        setFormikRef(formikRef, formik)

        return (
          <React.Fragment>
            <Accordion activeId="step-1" className={stepCss.accordion}>
              <Accordion.Panel
                id="step-1"
                summary={getString('basic')}
                details={<HttpStepBase formik={formik} isNewStep={isNewStep} readonly={isDisabled} />}
              />
              <Accordion.Panel
                id="step-2"
                summary={getString('responseMapping')}
                details={<ResponseMapping formik={formik} readonly={isDisabled} />}
              />
            </Accordion>
          </React.Fragment>
        )
      }}
    </Formik>
  )
}

export const HttpStepWidgetWithRef = React.forwardRef(HttpStepWidget)
