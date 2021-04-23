import React from 'react'
import type { IconName, SelectOption } from '@wings-software/uicore'
import { StepViewType, StepProps } from '@pipeline/components/AbstractSteps/Step'

import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import type { UseStringsReturn } from 'framework/strings'
import type { ContinousVerificationData, ContinousVerificationVariableStepProps, spec } from './types'
import { ContinousVerificationWidgetWithRef } from './components/ContinousVerificationWidget/ContinousVerificationWidget'
import { ContinousVerificationInputSetStep } from './components/ContinousVerificationInputSetStep/ContinousVerificationInputSetStep'
import { ContinousVerificationVariableStep } from './components/ContinousVerificationVariableStep/ContinousVerificationVariableStep'
import { getSpecFormData, getSpecYamlData, validateField, validateTimeout } from './utils'
import { cvDefaultValues } from './constants'

const ConnectorRefRegex = /^.+step\.spec\.executionTarget\.connectorRef$/

export class ContinousVerificationStep extends PipelineStep<ContinousVerificationData> {
  constructor() {
    super()
    this.invocationMap.set(ConnectorRefRegex, this.getSecretsListForYaml.bind(this))
    this._hasStepVariables = true
  }

  protected type = StepType.Verify
  protected stepName = 'Verify'
  protected stepIcon: IconName = 'cv-main'
  protected isHarnessSpecific = true
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  protected defaultValues: ContinousVerificationData = cvDefaultValues

  renderStep(props: StepProps<ContinousVerificationData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, isNewStep } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <ContinousVerificationInputSetStep
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

  validateInputSet(
    data: ContinousVerificationData,
    template: ContinousVerificationData,
    getString: UseStringsReturn['getString']
  ): object {
    const errors = { spec: {} } as any
    const { sensitivity, duration, baseline, trafficsplit, deploymentTag } = template?.spec?.spec as spec

    validateField(sensitivity as string, 'sensitivity', data, errors, getString)
    validateField(duration as string, 'duration', data, errors, getString)
    validateField(baseline as string, 'baseline', data, errors, getString)
    validateField(trafficsplit as string, 'trafficsplit', data, errors, getString)
    validateField(deploymentTag as string, 'deploymentTag', data, errors, getString)
    validateTimeout(template, getString, data, errors)
    return errors
  }

  protected async getSecretsListForYaml(): Promise<CompletionItemInterface[]> {
    //TODO implement this once story is picked up
    return new Promise(resolve => {
      resolve([])
    })
  }

  private getInitialValues(initialValues: ContinousVerificationData): ContinousVerificationData {
    return {
      ...initialValues,
      spec: {
        ...initialValues.spec,
        verificationJobRef: initialValues?.spec?.verificationJobRef,
        type: initialValues.spec?.type,
        spec: getSpecFormData(initialValues?.spec?.spec)
      }
    }
  }

  processFormData(data: ContinousVerificationData): ContinousVerificationData {
    return {
      ...data,
      spec: {
        ...data.spec,
        verificationJobRef: (data.spec.verificationJobRef as SelectOption)?.value as string,
        type: data.spec?.type,
        spec: getSpecYamlData(data.spec.spec)
      }
    }
  }
}
