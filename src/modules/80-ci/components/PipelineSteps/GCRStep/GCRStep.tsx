import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/exports'
import type { UseStringsReturn } from 'framework/exports'
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
import { GCRStepBaseWithRef } from './GCRStepBase'
import { GCRStepInputSet } from './GCRStepInputSet'
import { GCRStepVariables, GCRStepVariablesProps } from './GCRStepVariables'
import { inputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './GCRStepFunctionConfigs'

export interface GCRStepSpec {
  connectorRef: string
  host: string
  projectID: string
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

export interface GCRStepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: GCRStepSpec
}

export interface GCRStepSpecUI
  extends Omit<GCRStepSpec, 'connectorRef' | 'tags' | 'labels' | 'buildArgs' | 'pull' | 'resources'> {
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
export interface GCRStepDataUI extends Omit<GCRStepData, 'spec'> {
  spec: GCRStepSpecUI
}

export interface GCRStepProps {
  initialValues: GCRStepData
  template?: GCRStepData
  path?: string
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: GCRStepData) => void
}

export class GCRStep extends PipelineStep<GCRStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.GCR
  protected stepName = 'Build and Push to GCR'
  protected stepIcon: IconName = 'gcr-step'
  protected stepPaletteVisible = false

  protected defaultValues: GCRStepData = {
    identifier: '',
    type: StepType.GCR as string,
    spec: {
      connectorRef: '',
      host: '',
      projectID: '',
      imageName: '',
      tags: []
    }
  }

  processFormData<GCRStepDataUI>(data: GCRStepDataUI): GCRStepData {
    return getFormValuesInCorrectFormat<GCRStepDataUI, GCRStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet(data: GCRStepData, template?: GCRStepData, getString?: UseStringsReturn['getString']): object {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<GCRStepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <GCRStepInputSet
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
        <GCRStepVariables
          {...(customStepProps as GCRStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <GCRStepBaseWithRef
        initialValues={initialValues}
        stepViewType={stepViewType}
        onUpdate={onUpdate}
        ref={formikRef}
      />
    )
  }
}
