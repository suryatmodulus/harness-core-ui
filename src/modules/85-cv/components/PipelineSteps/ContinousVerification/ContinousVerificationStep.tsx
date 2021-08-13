import React from 'react'
import type { IconName } from '@wings-software/uicore'
import { connect, FormikErrors } from 'formik'
import { omit } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import type { StringsMap } from 'stringTypes'
import type { ContinousVerificationData, ContinousVerificationVariableStepProps, spec } from './types'
import { ContinousVerificationWidgetWithRef } from './components/ContinousVerificationWidget/ContinousVerificationWidget'
import { ContinousVerificationInputSetStep } from './components/ContinousVerificationInputSetStep/ContinousVerificationInputSetStep'
import { ContinousVerificationVariableStep } from './components/ContinousVerificationVariableStep/ContinousVerificationVariableStep'
import { getSpecFormData, getSpecYamlData, validateField, validateTimeout } from './utils'
import { cvDefaultValues } from './constants'

const ContinousVerificationInputSetStepFormik = connect(ContinousVerificationInputSetStep)
export class ContinousVerificationStep extends PipelineStep<ContinousVerificationData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.Verify
  protected stepName = 'Verify'
  protected stepIcon: IconName = 'cv-main'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.Verify'
  protected isHarnessSpecific = true
  protected defaultValues: ContinousVerificationData = cvDefaultValues

  renderStep(props: StepProps<ContinousVerificationData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, isNewStep } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <ContinousVerificationInputSetStepFormik
          initialValues={this.getInitialValues(initialValues)}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
          stepViewType={stepViewType}
          readonly={!!inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <ContinousVerificationVariableStep
          {...(customStepProps as ContinousVerificationVariableStepProps)}
          originalData={initialValues}
        />
      )
    }
    return (
      <ContinousVerificationWidgetWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ContinousVerificationData>): FormikErrors<ContinousVerificationData> {
    const errors: FormikErrors<ContinousVerificationData> = {}
    const { sensitivity, duration, baseline, deploymentTag } = (template?.spec?.spec as spec) || {}
    const isRequired = viewType === StepViewType.DeploymentForm
    if (getString) {
      validateField(sensitivity as string, 'sensitivity', data, errors, getString, isRequired)
      validateField(duration as string, 'duration', data, errors, getString, isRequired)
      validateField(baseline as string, 'baseline', data, errors, getString, isRequired)
      validateField(deploymentTag as string, 'deploymentTag', data, errors, getString, isRequired)
      validateTimeout(getString, data, errors, template, isRequired)
    }
    return errors
  }

  private getInitialValues(initialValues: ContinousVerificationData): ContinousVerificationData {
    return {
      ...initialValues,
      spec: {
        ...initialValues?.spec,
        spec: getSpecFormData(initialValues?.spec?.spec)
      }
    }
  }

  processFormData(data: ContinousVerificationData): ContinousVerificationData {
    return {
      ...data,
      spec: {
        ...omit(data?.spec, ['monitoredServiceRef', 'healthSources']),
        spec: getSpecYamlData(data?.spec?.spec, data?.spec?.type)
      }
    }
  }
}
