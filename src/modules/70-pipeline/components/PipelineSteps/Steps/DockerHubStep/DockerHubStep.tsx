import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/exports'
import type { UseStringsReturn } from 'framework/exports'
import { StepType } from '../../PipelineStepInterface'
import { PipelineStep } from '../../PipelineStep'
import { validateInputSet } from '../StepsValidateUtils'
import type {
  MultiTypeMapType,
  MultiTypeMapUIType,
  MultiTypeListType,
  MultiTypeListUIType,
  MultiTypeConnectorRef,
  Resources
} from '../StepsTypes'
import { DockerHubStepBaseWithRef } from './DockerHubStepBase'
import { DockerHubStepInputSet } from './DockerHubStepInputSet'
import { DockerHubStepVariables, DockerHubStepVariablesProps } from './DockerHubStepVariables'
import { inputSetViewValidateFieldsConfig } from './DockerHubStepFunctionConfigs'

export interface DockerHubStepSpec {
  connectorRef: string
  repo: string
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

export interface DockerHubStepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: DockerHubStepSpec
}

export interface DockerHubStepSpecUI
  extends Omit<DockerHubStepSpec, 'connectorRef' | 'tags' | 'labels' | 'buildArgs' | 'pull' | 'resources'> {
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
export interface DockerHubStepDataUI extends Omit<DockerHubStepData, 'spec'> {
  spec: DockerHubStepSpecUI
}

export interface DockerHubStepProps {
  initialValues: DockerHubStepData
  template?: DockerHubStepData
  path?: string
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: DockerHubStepData) => void
}

export class DockerHubStep extends PipelineStep<DockerHubStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.DockerHub
  protected stepName = 'Build and Push an image to Docker Registry'
  protected stepIcon: IconName = 'docker-hub-step'
  protected stepPaletteVisible = false

  protected defaultValues: DockerHubStepData = {
    identifier: '',
    type: StepType.DockerHub as string,
    spec: {
      connectorRef: '',
      repo: '',
      tags: []
    }
  }

  validateInputSet(
    data: DockerHubStepData,
    template?: DockerHubStepData,
    getString?: UseStringsReturn['getString']
  ): object {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<DockerHubStepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <DockerHubStepInputSet
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
        <DockerHubStepVariables
          {...(customStepProps as DockerHubStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <DockerHubStepBaseWithRef
        initialValues={initialValues}
        stepViewType={stepViewType}
        onUpdate={onUpdate}
        ref={formikRef}
      />
    )
  }
}
