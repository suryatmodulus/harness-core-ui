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
  MultiTypeListType,
  MultiTypeListUIType,
  MultiTypeConnectorRef,
  Resources,
  MultiTypeArchiveFormatOption,
  MultiTypeSelectOption
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { SaveCacheGCSStepBaseWithRef } from './SaveCacheGCSStepBase'
import { SaveCacheGCSStepInputSet } from './SaveCacheGCSStepInputSet'
import { SaveCacheGCSStepVariables, SaveCacheGCSStepVariablesProps } from './SaveCacheGCSStepVariables'
import { inputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './SaveCacheGCSStepFunctionConfigs'

export interface SaveCacheGCSStepSpec {
  connectorRef: string
  bucket: string
  key: string
  sourcePaths: MultiTypeListType
  archiveFormat?: MultiTypeArchiveFormatOption
  override?: boolean
  resources?: Resources
}

export interface SaveCacheGCSStepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: SaveCacheGCSStepSpec
}

export interface SaveCacheGCSStepSpecUI
  extends Omit<SaveCacheGCSStepSpec, 'connectorRef' | 'sourcePaths' | 'archiveFormat' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  sourcePaths: MultiTypeListUIType
  archiveFormat?: MultiTypeSelectOption
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface SaveCacheGCSStepDataUI extends Omit<SaveCacheGCSStepData, 'spec'> {
  spec: SaveCacheGCSStepSpecUI
}

export interface SaveCacheGCSStepProps {
  initialValues: SaveCacheGCSStepData
  template?: SaveCacheGCSStepData
  path?: string
  isNewStep?: boolean
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: SaveCacheGCSStepData) => void
}

export class SaveCacheGCSStep extends PipelineStep<SaveCacheGCSStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.SaveCacheGCS
  protected stepName = 'Save Cache to GCS'
  protected stepIcon: IconName = 'save-cache-gcs'
  protected stepPaletteVisible = false

  protected defaultValues: SaveCacheGCSStepData = {
    identifier: '',
    type: StepType.SaveCacheGCS as string,
    spec: {
      connectorRef: '',
      bucket: '',
      key: '',
      sourcePaths: []
    }
  }

  processFormData<T>(data: T): SaveCacheGCSStepData {
    return getFormValuesInCorrectFormat<T, SaveCacheGCSStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet(
    data: SaveCacheGCSStepData,
    template?: SaveCacheGCSStepData,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<SaveCacheGCSStepData> {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<SaveCacheGCSStepData>): JSX.Element {
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
        <SaveCacheGCSStepInputSet
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
        <SaveCacheGCSStepVariables
          {...(customStepProps as SaveCacheGCSStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <SaveCacheGCSStepBaseWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        isNewStep={isNewStep}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }
}
