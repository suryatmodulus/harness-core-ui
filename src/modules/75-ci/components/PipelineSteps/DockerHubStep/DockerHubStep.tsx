import React from 'react'
import type { IconName } from '@wings-software/uicore'
import { parse } from 'yaml'
import get from 'lodash-es/get'
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
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { DockerHubStepBaseWithRef } from './DockerHubStepBase'
import { DockerHubStepInputSet } from './DockerHubStepInputSet'
import { DockerHubStepVariables, DockerHubStepVariablesProps } from './DockerHubStepVariables'
import { inputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './DockerHubStepFunctionConfigs'
import { getConnectorSuggestions } from '../EditorSuggestionUtils'

const logger = loggerFor(ModuleName.CI)

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
  isNewStep?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: DockerHubStepData) => void
}

export class DockerHubStep extends PipelineStep<DockerHubStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this.invocationMap = new Map()
    this.invocationMap.set(/^.+step\.spec\.connectorRef$/, this.getConnectorList.bind(this))
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

  protected async getConnectorList(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err)
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (obj.type === StepType.DockerHub) {
        return getConnectorSuggestions(params, ['DockerRegistry'])
      }
    }
    return []
  }

  processFormData<T>(data: T): DockerHubStepData {
    return getFormValuesInCorrectFormat<T, DockerHubStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet(
    data: DockerHubStepData,
    template?: DockerHubStepData,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<DockerHubStepData> {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<DockerHubStepData>): JSX.Element {
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
        isNewStep={isNewStep}
        readonly={readonly}
      />
    )
  }
}
