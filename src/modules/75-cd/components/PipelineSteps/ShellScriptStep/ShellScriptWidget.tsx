import React from 'react'
import { Formik, Accordion } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { IdentifierValidation } from '@pipeline/components/PipelineStudio/PipelineUtils'
import type { ShellScriptFormData } from './shellScriptTypes'
import BaseShellScript from './BaseShellScript'
import ShellScriptInput from './ShellScriptInput'
import ExecutionTarget from './ExecutionTarget'
import ShellScriptOutput from './ShellScriptOutput'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

/**
 * Spec
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/1203634286/Shell+Script
 */

interface ShellScriptWidgetProps {
  initialValues: ShellScriptFormData
  onUpdate?: (data: ShellScriptFormData) => void
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
}

export function ShellScriptWidget(
  { initialValues, onUpdate, isNewStep = true, readonly }: ShellScriptWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { getString } = useStrings()

  const defaultSSHSchema = Yup.object().shape({
    name: Yup.string().trim().required(getString('pipelineSteps.stepNameRequired')),

    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      shell: Yup.string().trim().required(getString('validation.scriptTypeRequired')),
      source: Yup.object().shape({
        spec: Yup.object().shape({
          script: Yup.string().trim().required(getString('cd.scriptRequired'))
        })
      })
    }),
    ...IdentifierValidation()
  })

  const values: any = {
    ...initialValues,
    spec: {
      ...initialValues.spec,
      executionTarget: {
        ...initialValues.spec.executionTarget,
        connectorRef: undefined
      }
    }
  }

  const validationSchema = defaultSSHSchema

  return (
    <Formik<ShellScriptFormData>
      onSubmit={submit => {
        onUpdate?.(submit)
      }}
      initialValues={values}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<ShellScriptFormData>) => {
        // this is required
        setFormikRef(formikRef, formik)

        return (
          <Accordion activeId="step-1" className={stepCss.accordion}>
            <Accordion.Panel
              id="step-1"
              summary={getString('basic')}
              details={<BaseShellScript isNewStep={isNewStep} formik={formik} readonly={readonly} />}
            />
            <Accordion.Panel
              id="step-2"
              summary={getString('scriptInputVariables')}
              details={<ShellScriptInput formik={formik} readonly={readonly} />}
            />
            <Accordion.Panel
              id="step-4"
              summary={getString('scriptOutputVariables')}
              details={<ShellScriptOutput formik={formik} readonly={readonly} />}
            />
            <Accordion.Panel
              id="step-3"
              summary={getString('executionTarget')}
              details={<ExecutionTarget formik={formik} readonly={readonly} />}
            />
          </Accordion>
        )
      }}
    </Formik>
  )
}

export const ShellScriptWidgetWithRef = React.forwardRef(ShellScriptWidget)
