import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { FormikErrors } from 'formik'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { UseStringsReturn } from 'framework/strings'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type { MultiTypeConnectorRef, Resources } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { S3StepBaseWithRef } from './S3StepBase'
import { S3StepInputSet } from './S3StepInputSet'
import { S3StepVariables, S3StepVariablesProps } from './S3StepVariables'
import { inputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './S3StepFunctionConfigs'

export interface S3StepSpec {
  connectorRef: string
  region: string
  bucket: string
  sourcePath: string
  endpoint?: string
  target?: string
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypePullOption
  resources?: Resources
}

export interface S3StepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: S3StepSpec
}

export interface S3StepSpecUI extends Omit<S3StepSpec, 'connectorRef' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface S3StepDataUI extends Omit<S3StepData, 'spec'> {
  spec: S3StepSpecUI
}

export interface S3StepProps {
  initialValues: S3StepData
  template?: S3StepData
  path?: string
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: S3StepData) => void
}

export class S3Step extends PipelineStep<S3StepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.S3
  protected stepName = 'Upload Artifacts to S3'
  protected stepIcon: IconName = 'service-service-s3'
  protected stepPaletteVisible = false

  protected defaultValues: S3StepData = {
    identifier: '',
    type: StepType.S3 as string,
    spec: {
      connectorRef: '',
      region: '',
      bucket: '',
      sourcePath: ''
    }
  }

  processFormData<T>(data: T): S3StepData {
    return getFormValuesInCorrectFormat<T, S3StepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet(
    data: S3StepData,
    template?: S3StepData,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<S3StepData> {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<S3StepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, readonly } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <S3StepInputSet
          initialValues={initialValues}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          onUpdate={onUpdate}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <S3StepVariables
          {...(customStepProps as S3StepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <S3StepBaseWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }
}
