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
import type {
  MultiTypeMapType,
  MultiTypeMapUIType,
  MultiTypeListType,
  MultiTypeListUIType,
  MultiTypeConnectorRef,
  Resources
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { ECRStepBaseWithRef } from './ECRStepBase'
import { ECRStepInputSet } from './ECRStepInputSet'
import { ECRStepVariables, ECRStepVariablesProps } from './ECRStepVariables'
import { inputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './ECRStepFunctionConfigs'

export interface ECRStepSpec {
  connectorRef: string
  region: string
  account: string
  imageName: string
  tags: MultiTypeListType
  dockerfile?: string
  context?: string
  labels?: MultiTypeMapType
  buildArgs?: MultiTypeMapType
  target?: string
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypePullOption
  resources?: Resources
}

export interface ECRStepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: ECRStepSpec
}

export interface ECRStepSpecUI
  extends Omit<ECRStepSpec, 'connectorRef' | 'tags' | 'labels' | 'buildArgs' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  tags: MultiTypeListUIType
  labels?: MultiTypeMapUIType
  buildArgs?: MultiTypeMapUIType
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface ECRStepDataUI extends Omit<ECRStepData, 'spec'> {
  spec: ECRStepSpecUI
}

export interface ECRStepProps {
  initialValues: ECRStepData
  template?: ECRStepData
  path?: string
  readonly?: boolean
  isNewStep?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: ECRStepData) => void
}

export class ECRStep extends PipelineStep<ECRStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.ECR
  protected stepName = 'Build and Push to ECR'
  protected stepIcon: IconName = 'ecr-step'
  protected stepPaletteVisible = false

  protected defaultValues: ECRStepData = {
    identifier: '',
    type: StepType.ECR as string,
    spec: {
      connectorRef: '',
      region: '',
      account: '',
      imageName: '',
      tags: []
    }
  }

  processFormData<T>(data: T): ECRStepData {
    return getFormValuesInCorrectFormat<T, ECRStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet(
    data: ECRStepData,
    template?: ECRStepData,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<ECRStepData> {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<ECRStepData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly
    } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <ECRStepInputSet
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
        <ECRStepVariables
          {...(customStepProps as ECRStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <ECRStepBaseWithRef
        initialValues={initialValues}
        stepViewType={stepViewType}
        onUpdate={onUpdate}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
      />
    )
  }
}
