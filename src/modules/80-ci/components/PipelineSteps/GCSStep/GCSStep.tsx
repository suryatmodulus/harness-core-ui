import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/exports'
import type { UseStringsReturn } from 'framework/exports'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type { MultiTypeConnectorRef, Resources } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { GCSStepBaseWithRef } from './GCSStepBase'
import { GCSStepInputSet } from './GCSStepInputSet'
import { GCSStepVariables, GCSStepVariablesProps } from './GCSStepVariables'
import { inputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './GCSStepFunctionConfigs'

export interface GCSStepSpec {
  connectorRef: string
  bucket: string
  sourcePath: string
  target?: string
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypePullOption
  resources?: Resources
}

export interface GCSStepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: GCSStepSpec
}

export interface GCSStepSpecUI extends Omit<GCSStepSpec, 'connectorRef' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface GCSStepDataUI extends Omit<GCSStepData, 'spec'> {
  spec: GCSStepSpecUI
}

export interface GCSStepProps {
  initialValues: GCSStepData
  template?: GCSStepData
  path?: string
  readonly?: boolean
  onUpdate?: (data: GCSStepData) => void
  stepViewType?: StepViewType
}

export class GCSStep extends PipelineStep<GCSStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.GCS
  protected stepName = 'Upload Artifacts to GCS'
  protected stepIcon: IconName = 'gcs-step'
  protected stepPaletteVisible = false

  protected defaultValues: GCSStepData = {
    identifier: '',
    type: StepType.GCS as string,
    spec: {
      connectorRef: '',
      bucket: '',
      sourcePath: ''
    }
  }

  processFormData<GCSStepDataUI>(data: GCSStepDataUI): GCSStepData {
    return getFormValuesInCorrectFormat<GCSStepDataUI, GCSStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet(data: GCSStepData, template?: GCSStepData, getString?: UseStringsReturn['getString']): object {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }
  renderStep(props: StepProps<GCSStepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <GCSStepInputSet
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
        <GCSStepVariables
          {...(customStepProps as GCSStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <GCSStepBaseWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }
}
