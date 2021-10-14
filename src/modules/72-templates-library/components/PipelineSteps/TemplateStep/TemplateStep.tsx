import React from 'react'
import type { FormikErrors } from 'formik'
import { IconName, MultiTypeInputType } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { TemplateStepData } from '@pipeline/utils/tempates'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { StepElementConfig } from 'services/cd-ng'
import { TemplateStepWidgetWithRef } from './TemplateStepWidget'

export class TemplateStep extends PipelineStep<TemplateStepData> {
  constructor() {
    super()
  }

  protected type = StepType.Template
  protected stepName = 'Template step'
  protected stepIcon: IconName = 'template-library'

  protected defaultValues: TemplateStepData = {
    identifier: '',
    name: '',
    template: {} as any
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

  processFormData(values: TemplateStepData): TemplateStepData {
    return values //processFormData(values)
  }

  renderStep(this: TemplateStep, props: StepProps<TemplateStepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, formikRef, isNewStep, readonly, factory, inputSetData } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      const prefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
      return (
        <StepWidget<Partial<StepElementConfig>>
          factory={factory}
          initialValues={initialValues.template?.templateInputs || {}}
          allValues={inputSetData?.allValues?.template?.templateInputs}
          // eslint-disable-next-line
          // @ts-ignore to be fixed later
          template={inputSetData?.template}
          readonly={!!inputSetData?.readonly}
          type={initialValues.template?.templateInputs.type as StepType}
          path={`${prefix}template.templateInputs`}
          stepViewType={StepViewType.InputSet}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return <div />
    }
    return (
      <TemplateStepWidgetWithRef
        ref={formikRef}
        stepViewType={stepViewType}
        initialValues={initialValues}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        isNewStep={isNewStep}
        readonly={readonly}
        factory={factory}
      />
    )
  }
}
