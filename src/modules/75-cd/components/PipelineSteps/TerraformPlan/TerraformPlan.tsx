import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'

import { isEmpty } from 'lodash-es'
import { yupToFormErrors, FormikErrors } from 'formik'

import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepViewType } from '@pipeline/exports'
import type { StringKeys } from 'framework/exports'
import TerraformInputStep from '../Common/Terraform/Editview/TerraformInputStep'
import { TerraformVariableStep } from '../Common/Terraform/TerraformVariableView'
import type { TerraformData, TerraformVariableStepProps } from '../Common/Terraform/TerraformInterfaces'

import TerraformEditView from '../Common/Terraform/Editview/TerraformEditView'

const TerraformPlanWidgetWithRef = React.forwardRef(TerraformEditView)

export class TerraformPlan extends PipelineStep<TerraformData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  protected type = StepType.TerraformPlan
  protected defaultValues: TerraformData = {
    identifier: '',
    timeout: '10m',
    delegateSelectors: [],
    spec: {
      provisionerIdentifier: '',
      configuration: {
        type: ''
      }
    }
  }
  protected stepIcon: IconName = 'terraform-plan'
  protected stepName = 'Terraform Plan'
  validateInputSet(
    data: TerraformData,
    template?: TerraformData,
    getString?: (key: StringKeys, vars?: Record<string, any>) => string
  ): FormikErrors<TerraformData> {
    const errors = {} as any
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      const timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }
  renderStep(props: StepProps<TerraformData, unknown>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, isNewStep } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <TerraformInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <TerraformVariableStep
          {...(customStepProps as TerraformVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepType={StepType.TerraformPlan}
        />
      )
    }
    return (
      <TerraformPlanWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
        stepType={StepType.TerraformPlan}
      />
    )
  }
}
