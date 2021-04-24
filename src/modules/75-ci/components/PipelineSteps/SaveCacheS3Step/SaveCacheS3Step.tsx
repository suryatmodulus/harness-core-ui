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
  MultiTypeArchiveFormatOption,
  MultiTypeSelectOption,
  Resources
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { SaveCacheS3StepBaseWithRef } from './SaveCacheS3StepBase'
import { SaveCacheS3StepInputSet } from './SaveCacheS3StepInputSet'
import { SaveCacheS3StepVariables, SaveCacheS3StepVariablesProps } from './SaveCacheS3StepVariables'
import { inputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './SaveCacheS3StepFunctionConfigs'

export interface SaveCacheS3StepSpec {
  connectorRef: string
  region: string
  bucket: string
  key: string
  sourcePaths: MultiTypeListType
  endpoint?: string
  archiveFormat?: MultiTypeArchiveFormatOption
  override?: boolean
  pathStyle?: boolean
  resources?: Resources
}

export interface SaveCacheS3StepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: SaveCacheS3StepSpec
}

export interface SaveCacheS3StepSpecUI
  extends Omit<SaveCacheS3StepSpec, 'connectorRef' | 'sourcePaths' | 'archiveFormat' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  sourcePaths: MultiTypeListUIType
  archiveFormat?: MultiTypeSelectOption
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface SaveCacheS3StepDataUI extends Omit<SaveCacheS3StepData, 'spec'> {
  spec: SaveCacheS3StepSpecUI
}

export interface SaveCacheS3StepProps {
  initialValues: SaveCacheS3StepData
  template?: SaveCacheS3StepData
  path?: string
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: SaveCacheS3StepData) => void
}
export class SaveCacheS3Step extends PipelineStep<SaveCacheS3StepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.SaveCacheS3
  protected stepName = 'Save Cache to S3'
  protected stepIcon: IconName = 'save-cache-s3'
  protected stepPaletteVisible = false

  protected defaultValues: SaveCacheS3StepData = {
    identifier: '',
    type: StepType.SaveCacheS3 as string,
    spec: {
      connectorRef: '',
      region: '',
      bucket: '',
      key: '',
      sourcePaths: []
    }
  }

  processFormData<T>(data: T): SaveCacheS3StepData {
    return getFormValuesInCorrectFormat<T, SaveCacheS3StepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet(
    data: SaveCacheS3StepData,
    template?: SaveCacheS3StepData,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<SaveCacheS3StepData> {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<SaveCacheS3StepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, readonly } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <SaveCacheS3StepInputSet
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
        <SaveCacheS3StepVariables
          {...(customStepProps as SaveCacheS3StepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <SaveCacheS3StepBaseWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }
}
