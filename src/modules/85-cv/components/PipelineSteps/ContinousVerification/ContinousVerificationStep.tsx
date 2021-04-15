import React from 'react'
import type { IconName, SelectOption } from '@wings-software/uicore'
import { omitBy, isNil } from 'lodash-es'
import { StepViewType, StepProps } from '@pipeline/exports'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { VariableResponseMapValue } from 'services/pipeline-ng'

import type { ContinousVerificationData, ContinousVerificationFormData, spec } from './continousVerificationTypes'
import { ContinousVerificationWidgetWithRef } from './ContinousVerificationWidget'
import { ContinousVerificationInputSetStep } from './ContinousVerificationInputSetStep'
import { ContinousVerificationVariableStep } from './ContinousVerificationVariableStep'
import {
  baseLineOptions,
  durationOptions,
  trafficSplitPercentageOptions,
  VerificationSensitivityOptions
} from './constants'

const ConnectorRefRegex = /^.+step\.spec\.executionTarget\.connectorRef$/

export interface ContinousVerificationVariableStepProps {
  metadataMap: Record<string, VariableResponseMapValue>
  stageIdentifier: string
  variablesData: ContinousVerificationData
  originalData: ContinousVerificationData
}

export class ContinousVerificationStep extends PipelineStep<ContinousVerificationData> {
  constructor() {
    super()
    this.invocationMap.set(ConnectorRefRegex, this.getSecretsListForYaml.bind(this))
    //TODO will be turned true when variables view story is picked up
    this._hasStepVariables = false
  }

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

  validateInputSet(): object {
    const errors = {} as any
    //TODO implement this once story is picked up

    return errors
  }

  protected type = StepType.Verify
  protected stepName = 'CV Step'
  protected stepIcon: IconName = 'cv-main'
  //TODO - to be asked from PM
  protected isHarnessSpecific = true
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  protected defaultValues: ContinousVerificationData = {
    identifier: '',
    timeout: '10m',
    spec: {
      verificationJobRef: '',
      type: '',
      spec: {
        sensitivity: '',
        duration: '',
        baseline: '',
        trafficsplit: '',
        serviceRef: '',
        envRef: '',
        deploymentTag: ''
      }
    }
  }

  protected async getSecretsListForYaml(): Promise<CompletionItemInterface[]> {
    //TODO implement this once story is picked up
    return new Promise(resolve => {
      resolve([])
    })
  }

  private getInitialValues(initialValues: ContinousVerificationData): ContinousVerificationFormData {
    return {
      ...initialValues,
      spec: {
        ...initialValues.spec,
        verificationJobRef: initialValues?.spec?.verificationJobRef,
        type: initialValues.spec?.type,
        spec: this.getspecFormData(initialValues?.spec?.spec)
      }
    }
  }

  processFormData(data: ContinousVerificationFormData): ContinousVerificationData {
    return {
      ...data,
      spec: {
        ...data.spec,
        verificationJobRef: (data.spec.verificationJobRef as SelectOption)?.value as string,
        type: data.spec?.type,
        spec: this.getspecYamlData(data.spec.spec)
      }
    }
  }

  private getspecYamlData(specInfo: spec | undefined): spec {
    const validspec = omitBy(specInfo, isNil)

    Object.keys(validspec).map((key: string) => {
      validspec[key] = validspec[key].value ? validspec[key].value : validspec[key]
    })

    return validspec
  }

  private getspecFormData(specInfo: spec | undefined): spec {
    const validspec: spec | undefined = { ...specInfo }
    if (specInfo) {
      Object.keys(specInfo).map((key: string) => {
        switch (key) {
          case 'sensitivity':
            this.setFieldData(validspec, 'sensitivity', VerificationSensitivityOptions)
            break
          case 'duration':
            this.setFieldData(validspec, 'duration', durationOptions)
            break
          case 'baseline':
            this.setFieldData(validspec, 'baseline', baseLineOptions)
            break
          case 'trafficsplit':
            this.setFieldData(validspec, 'trafficsplit', trafficSplitPercentageOptions)
            break
          default:
        }
      })
    }
    return validspec
  }

  private setFieldData(validspec: spec | undefined, field: string, options: SelectOption[]): void {
    if (validspec && validspec[field]) {
      validspec[field] = options.find((el: SelectOption) => el.value === (validspec && validspec[field]))
    }
  }
}
