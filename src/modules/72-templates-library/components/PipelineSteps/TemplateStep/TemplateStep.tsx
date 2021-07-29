import React from 'react'
import type { FormikErrors } from 'formik'
import type { IconName } from '@wings-software/uicore'
import { StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'

import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { TemplateStepWidgetWithRef } from './TemplateStepWidget'

export interface TemplateStepData {
  identifier: string
  name: string
  type: StepType
  'step-template': string
  inputs: { [key: string]: any }
}

export class TemplateStep extends PipelineStep<TemplateStepData> {
  constructor() {
    super()
  }

  protected type = StepType.TemplateStep
  protected stepName = 'Template step'
  protected stepIcon: IconName = 'library'

  protected defaultValues: TemplateStepData = {
    identifier: '',
    name: '',
    type: StepType.TemplateStep,
    'step-template': '',
    inputs: []
  }

  validateInputSet({
    data: _data,
    template: _template,
    getString: _getString,
    viewType: _vieweType
  }: ValidateInputSetProps<TemplateStepData>): FormikErrors<TemplateStepData> {
    const errors = {} as any
    return errors
  }

  processFormData(values: TemplateStepData) {
    return values //processFormData(values)
  }

  renderStep(this: TemplateStep, props: StepProps<TemplateStepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, formikRef, isNewStep, readonly } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return <div />
    } else if (stepViewType === StepViewType.InputVariable) {
      return <div />
    }
    return (
      <TemplateStepWidgetWithRef
        ref={formikRef}
        stepViewType={stepViewType}
        initialValues={processInitialValues(initialValues)}
        onUpdate={(values: TemplateStepData) => onUpdate?.(values)}
        isNewStep={isNewStep}
        readonly={readonly}
      />
    )
  }
}

function processInitialValues<T>(initialValues: T): T {
  return initialValues
}
