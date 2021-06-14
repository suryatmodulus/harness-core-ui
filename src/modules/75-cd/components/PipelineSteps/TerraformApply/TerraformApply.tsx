import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import { v4 as uuid } from 'uuid'

import { isEmpty } from 'lodash-es'
import { yupToFormErrors, FormikErrors } from 'formik'
import type { StringNGVariable } from 'services/cd-ng'

import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import type { StringKeys } from 'framework/strings'
import TerraformInputStep from '../Common/Terraform/TerraformInputStep'
import { TerraformVariableStep } from '../Common/Terraform/TerraformVariableView'
import {
  onSubmitTerraformData,
  TerraformData,
  TerraformVariableStepProps,
  TFFormData
} from '../Common/Terraform/TerraformInterfaces'

import TerraformEditView from '../Common/Terraform/Editview/TerraformEditView'

const TerraformApplyWidgetWithRef = React.forwardRef(TerraformEditView)

export class TerraformApply extends PipelineStep<TFFormData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  protected type = StepType.TerraformApply
  protected defaultValues: TFFormData = {
    identifier: '',
    timeout: '10m',
    spec: {
      provisionerIdentifier: ''
    }
  }
  protected stepIcon: IconName = 'terraform-apply-new'
  protected stepName = 'Terraform Apply'
  /* istanbul ignore next */
  validateInputSet(
    data: TFFormData,
    template?: TFFormData,
    getString?: (key: StringKeys, vars?: Record<string, any>) => string
  ): FormikErrors<TFFormData> {
    /* istanbul ignore next */
    const errors = {} as any
    /* istanbul ignore next */
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      const timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore next */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore next */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    /* istanbul ignore next */
    return errors
  }

  private getInitialValues(data: TFFormData): TerraformData {
    const envVars = data.spec?.configuration?.spec?.environmentVariables as StringNGVariable[]
    const formData = {
      ...data,
      spec: {
        ...data.spec,
        configuration: {
          ...data.spec?.configuration,
          spec: {
            ...data.spec?.configuration?.spec,
            targets: Array.isArray(data.spec?.configuration?.spec?.targets)
              ? data.spec?.configuration?.spec?.targets.map(target => ({
                  value: target,
                  id: uuid()
                }))
              : [{ value: '', id: uuid() }],
            environmentVariables: Array.isArray(envVars)
              ? envVars.map(variable => ({
                  key: variable.name,
                  value: variable.value,
                  id: uuid()
                }))
              : [{ key: '', value: '', id: uuid() }]
          }
        }
      }
    }
    return formData
  }
  /* istanbul ignore next */
  processFormData(data: any): TFFormData {
    return onSubmitTerraformData(data)
  }
  renderStep(props: StepProps<TFFormData, unknown>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      formikRef,
      inputSetData,
      customStepProps,
      isNewStep,
      path,
      readonly
    } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <TerraformInputStep
          initialValues={initialValues}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          inputSetData={inputSetData}
          path={path}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <TerraformVariableStep
          {...(customStepProps as TerraformVariableStepProps)}
          initialValues={initialValues}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
        />
      )
    }
    return (
      <TerraformApplyWidgetWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        stepType={StepType.TerraformApply}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }
}
