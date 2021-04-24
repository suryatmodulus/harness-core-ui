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
import { RunStepBaseWithRef } from './RunStepBase'
import { RunStepInputSet } from './RunStepInputSet'
import { RunStepVariables, RunStepVariablesProps } from './RunStepVariables'
import { inputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './RunStepFunctionConfigs'
import { getConnectorSuggestions } from '../EditorSuggestionUtils'

const logger = loggerFor(ModuleName.CI)

const stepConnectorRegEx = /^.+step\.spec\.connectorRef$/
const ciPropsConRegEx = /^pipeline\.properties\.ci\.codebase\.connectorRef$/
const infrastructureConRegEx = /stage\.spec\.infrastructure\.spec\.connectorRef$/
const serviceDepConRegEx = /stage\.spec\.serviceDependencies\.spec\.connectorRef$/

export interface RunStepSpec {
  connectorRef: string
  image: string
  command: string
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

export interface RunStepData {
  identifier: string
  name?: string
  description?: string
  type: string
  timeout?: string
  spec: RunStepSpec
}

export interface RunStepSpecUI
  extends Omit<RunStepSpec, 'connectorRef' | 'reports' | 'envVariables' | 'outputVariables' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  reportPaths?: MultiTypeListUIType
  envVariables?: MultiTypeMapUIType
  outputVariables?: MultiTypeListUIType
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface RunStepDataUI extends Omit<RunStepData, 'spec'> {
  spec: RunStepSpecUI
}

export interface RunStepProps {
  initialValues: RunStepData
  template?: RunStepData
  path?: string
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: RunStepData) => void
}

export class RunStep extends PipelineStep<RunStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this.invocationMap = new Map()
    this.invocationMap.set(stepConnectorRegEx, this.getConnectorList.bind(this, undefined))
    this.invocationMap.set(
      ciPropsConRegEx,
      this.getConnectorList.bind(this, ['Github', 'Gitlab', 'Bitbucket', 'Codecommit'])
    )
    this.invocationMap.set(infrastructureConRegEx, this.getConnectorList.bind(this, ['K8sCluster']))
    this.invocationMap.set(serviceDepConRegEx, this.getConnectorList.bind(this, ['Gcp', 'Aws', 'DockerRegistry']))
  }

  protected type = StepType.Run
  protected stepName = 'Configure Run Step'
  protected stepIcon: IconName = 'run-step'
  protected stepPaletteVisible = false

  protected defaultValues: RunStepData = {
    identifier: '',
    type: StepType.Run as string,
    spec: {
      connectorRef: '',
      image: '',
      command: ''
    }
  }

  protected async getConnectorList(
    connectorTypes: string[] | undefined,
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    if (connectorTypes?.length) {
      return getConnectorSuggestions(params, connectorTypes)
    }
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err)
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (obj.type === StepType.Run || obj.type === StepType.Plugin) {
        return getConnectorSuggestions(params, ['Gcp', 'Aws', 'DockerRegistry'])
      }
    }
    return []
  }

  processFormData<T>(data: T): RunStepData {
    return getFormValuesInCorrectFormat<T, RunStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet(
    data: RunStepData,
    template?: RunStepData,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<RunStepData> {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<RunStepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, readonly } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <RunStepInputSet
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
        <RunStepVariables
          {...(customStepProps as RunStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <RunStepBaseWithRef
        initialValues={initialValues}
        stepViewType={stepViewType}
        onUpdate={onUpdate}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }
}
