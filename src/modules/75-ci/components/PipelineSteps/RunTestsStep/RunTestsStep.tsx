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
  MultiTypeSelectOption,
  MultiTypePullOption,
  MultiTypeConnectorRef,
  MultiTypeListType,
  MultiTypeListUIType,
  MultiTypeMapType,
  MultiTypeMapUIType,
  Resources
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { RunTestsStepBaseWithRef } from './RunTestsStepBase'
import { RunTestsStepInputSet } from './RunTestsStepInputSet'
import { RunTestsStepVariables, RunTestsStepVariablesProps } from './RunTestsStepVariables'
import { inputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './RunTestsStepFunctionConfigs'

export interface RunTestsStepSpec {
  connectorRef: string
  image: string
  args: string
  buildTool: MultiTypePullOption
  language: MultiTypePullOption
  packages: string
  runOnlySelectedTests?: boolean
  testAnnotations?: string
  preCommand?: string
  postCommand?: string
  reports?: {
    type: 'JUnit'
    spec: {
      paths: MultiTypeListType
    }
  }
  envVariables?: MultiTypeMapType
  outputVariables?: MultiTypeListType
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypePullOption
  resources?: Resources
}

export interface RunTestsStepData {
  identifier: string
  name?: string
  description?: string
  type: string
  timeout?: string
  spec: RunTestsStepSpec
}

export interface RunTestsStepSpecUI
  extends Omit<
    RunTestsStepSpec,
    'connectorRef' | 'buildTool' | 'language' | 'reports' | 'envVariables' | 'outputVariables' | 'resources'
  > {
  connectorRef: MultiTypeConnectorRef
  buildTool: MultiTypeSelectOption
  language: MultiTypeSelectOption
  reportPaths?: MultiTypeListUIType
  envVariables?: MultiTypeMapUIType
  outputVariables?: MultiTypeListUIType
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface RunTestsStepDataUI extends Omit<RunTestsStepData, 'spec'> {
  spec: RunTestsStepSpecUI
}

export interface RunTestsStepProps {
  initialValues: RunTestsStepData
  template?: RunTestsStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: RunTestsStepData) => void
}

export class RunTestsStep extends PipelineStep<RunTestsStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.RunTests
  protected stepName = 'Configure Run Tests Step'
  protected stepIcon: IconName = 'run-tests-step'
  protected stepPaletteVisible = false

  protected defaultValues: RunTestsStepData = {
    identifier: '',
    type: StepType.RunTests as string,
    spec: {
      connectorRef: '',
      image: '',
      args: '',
      buildTool: 'maven',
      language: 'java',
      packages: '',
      runOnlySelectedTests: true
    }
  }

  processFormData<T>(data: T): RunTestsStepData {
    return getFormValuesInCorrectFormat<T, RunTestsStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet(
    data: RunTestsStepData,
    template?: RunTestsStepData,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<RunTestsStepData> {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<RunTestsStepData>): JSX.Element {
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
        <RunTestsStepInputSet
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
        <RunTestsStepVariables
          {...(customStepProps as RunTestsStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <RunTestsStepBaseWithRef
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
