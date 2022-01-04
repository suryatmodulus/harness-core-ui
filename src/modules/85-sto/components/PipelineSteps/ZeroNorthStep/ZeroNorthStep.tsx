import React from 'react'
import type { IconName, MultiTypeInputType } from '@wings-software/uicore'
import type { FormikErrors } from 'formik'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type {
  MultiTypeSelectOption,
  MultiTypeMapType,
  MultiTypeMapUIType,
  MultiTypeConnectorRef,
  Resources,
  MultiTypeListUIType,
  MultiTypeListType
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StringsMap } from 'stringTypes'
import { ZeroNorthStepBaseWithRef } from './ZeroNorthStepBase'
import { ZeroNorthStepInputSet } from './ZeroNorthStepInputSet'
import { ZeroNorthStepVariables, ZeroNorthStepVariablesProps } from './ZeroNorthStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './ZeroNorthStepFunctionConfigs'

export interface ZeroNorthStepSpec {
  connectorRef: string
  image: string
  privileged?: boolean
  reports?: {
    type: 'JUnit'
    spec: {
      paths: MultiTypeListType
    }
  }
  settings?: MultiTypeMapType
  imagePullPolicy?: MultiTypeSelectOption
  runAsUser?: string
  resources?: Resources
}

export interface ZeroNorthStepData {
  identifier: string
  name?: string
  description?: string
  type: string
  timeout?: string
  spec: ZeroNorthStepSpec
}

export interface ZeroNorthStepSpecUI
  extends Omit<ZeroNorthStepSpec, 'connectorRef' | 'reports' | 'settings' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  reportPaths?: MultiTypeListUIType
  settings?: MultiTypeMapUIType
  // Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  runAsUser?: string
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface ZeroNorthStepDataUI extends Omit<ZeroNorthStepData, 'spec'> {
  spec: ZeroNorthStepSpecUI
}

export interface ZeroNorthStepProps {
  initialValues: ZeroNorthStepData
  template?: ZeroNorthStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: ZeroNorthStepData) => void
  onChange?: (data: ZeroNorthStepData) => void
  allowableTypes: MultiTypeInputType[]
}

export class ZeroNorthStep extends PipelineStep<ZeroNorthStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.ZeroNorth
  protected stepName = 'Configure ZeroNorth Step'
  protected stepIcon: IconName = 'shield'
  protected stepIconColor = '#4F5162'
  protected stepDescription: keyof StringsMap = 'sto.stepDescription.ZeroNorth'

  protected stepPaletteVisible = false

  protected defaultValues: ZeroNorthStepData = {
    identifier: '',
    type: StepType.ZeroNorth as string,
    spec: {
      connectorRef: '',
      image: ''
    }
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): ZeroNorthStepData {
    return getFormValuesInCorrectFormat<T, ZeroNorthStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ZeroNorthStepData>): FormikErrors<ZeroNorthStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<ZeroNorthStepData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      onChange,
      allowableTypes
    } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <ZeroNorthStepInputSet
          initialValues={initialValues}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          onUpdate={onUpdate}
          onChange={onChange}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <ZeroNorthStepVariables
          {...(customStepProps as ZeroNorthStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <ZeroNorthStepBaseWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={stepViewType || StepViewType.Edit}
        onUpdate={onUpdate}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
      />
    )
  }
}
