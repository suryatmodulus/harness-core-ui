import React from 'react'
import { IconName, Formik, FormInput } from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { NameSchema } from '@common/utils/Validation'
import type { StepViewType, StepProps } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepGroupElement } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { useStrings } from 'framework/strings'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface StepGroupWidgetProps {
  initialValues: StepGroupElement
  isNewStep?: boolean
  onUpdate?: (data: StepGroupElement) => void
  stepViewType?: StepViewType
}

function StepGroupWidget(
  props: StepGroupWidgetProps,
  formikRef: StepFormikFowardRef<StepGroupElement>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true } = props
  const { getString } = useStrings()
  return (
    <>
      <Formik<StepGroupElement>
        onSubmit={values => {
          onUpdate?.(values)
        }}
        formName="stepGroup"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: NameSchema()
        })}
      >
        {(formik: FormikProps<StepGroupElement>) => {
          setFormikRef(formikRef, formik)
          return (
            <div className={cx(stepCss.formGroup, stepCss.md)}>
              <FormInput.InputWithIdentifier inputLabel={getString('name')} isIdentifierEditable={isNewStep} />
            </div>
          )
        }}
      </Formik>
    </>
  )
}
const StepGroupWidgetRef = React.forwardRef(StepGroupWidget)
export class StepGroupStep extends PipelineStep<StepGroupElement> {
  renderStep(props: StepProps<StepGroupElement>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, formikRef, isNewStep } = props

    return (
      <StepGroupWidgetRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }

  validateInputSet(): Record<string, any> {
    return {}
  }
  protected type = StepType.StepGroup
  protected stepName = 'Step Group'
  protected stepIcon: IconName = 'step-group'
  protected stepPaletteVisible = false

  protected defaultValues: StepGroupElement = {
    identifier: '',
    steps: []
  }
}
