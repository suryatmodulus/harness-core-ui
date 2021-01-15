import React from 'react'
import { IconName, Text, Formik, FormInput, Button } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import type { StepViewType, StepProps } from '@pipeline/exports'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepGroupElement } from 'services/cd-ng'
import { StepType } from '../../PipelineStepInterface'
import i18n from './StepGroupStep.i18n'
import { PipelineStep } from '../../PipelineStep'
import stepCss from '../Steps.module.scss'

interface StepGroupWidgetProps {
  initialValues: StepGroupElement
  onUpdate?: (data: StepGroupElement) => void
  stepViewType?: StepViewType
}

function StepGroupWidget(
  props: StepGroupWidgetProps,
  formikRef: StepFormikFowardRef<StepGroupElement>
): React.ReactElement {
  const { initialValues, onUpdate } = props
  return (
    <>
      <Text className={stepCss.boldLabel} font={{ size: 'medium' }}>
        {i18n.stepGroup}
      </Text>
      <Formik<StepGroupElement>
        onSubmit={values => {
          onUpdate?.(values)
        }}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(i18n.stageNameRequired)
        })}
      >
        {(formik: FormikProps<StepGroupElement>) => {
          const { submitForm } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              <FormInput.InputWithIdentifier inputLabel={i18n.displayName} />
              <Button intent="primary" text={i18n.submit} onClick={submitForm} />
            </>
          )
        }}
      </Formik>
    </>
  )
}
const StepGroupWidgetRef = React.forwardRef(StepGroupWidget)
export class StepGroupStep extends PipelineStep<StepGroupElement> {
  renderStep(props: StepProps<StepGroupElement>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, formikRef } = props

    return (
      <StepGroupWidgetRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }

  validateInputSet(): object {
    return {}
  }
  protected type = StepType.StepGroup
  protected stepName = i18n.stepGroup
  protected stepIcon: IconName = 'step-group'
  protected stepPaletteVisible = false

  protected defaultValues: StepGroupElement = {
    identifier: '',
    steps: []
  }
}
