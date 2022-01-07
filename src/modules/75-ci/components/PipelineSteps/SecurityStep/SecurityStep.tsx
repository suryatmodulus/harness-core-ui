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
import { SecurityStepBaseWithRef } from './SecurityStepBase'
import { SecurityStepInputSet } from './SecurityStepInputSet'
import { SecurityStepVariables, SecurityStepVariablesProps } from './SecurityStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './SecurityStepFunctionConfigs'

export interface SecurityStepSpec {
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

export interface SecurityStepData {
  identifier: string
  name?: string
  description?: string
  type: string
  timeout?: string
  spec: SecurityStepSpec
}

export interface SecurityStepSpecUI
  extends Omit<SecurityStepSpec, 'connectorRef' | 'reports' | 'settings' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  reportPaths?: MultiTypeListUIType
  settings?: MultiTypeMapUIType
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  runAsUser?: string
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface SecurityStepDataUI extends Omit<SecurityStepData, 'spec'> {
  spec: SecurityStepSpecUI
}

export interface SecurityStepProps {
  initialValues: SecurityStepData
  template?: SecurityStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: SecurityStepData) => void
  onChange?: (data: SecurityStepData) => void
  allowableTypes: MultiTypeInputType[]
}

export class SecurityStep extends PipelineStep<SecurityStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.Security
  protected stepName = 'Configure Security Step'
  protected stepIcon: IconName = 'plugin-step'
  protected stepIconColor = '#4F5162'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.Security'

  protected stepPaletteVisible = false

  protected defaultValues: SecurityStepData = {
    identifier: '',
    type: StepType.Security as string,
    spec: {
      connectorRef: '',
      image: ''
    }
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): SecurityStepData {
    return getFormValuesInCorrectFormat<T, SecurityStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<SecurityStepData>): FormikErrors<SecurityStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<SecurityStepData>): JSX.Element {
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
        <SecurityStepInputSet
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
        <SecurityStepVariables
          {...(customStepProps as SecurityStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <SecurityStepBaseWithRef
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
