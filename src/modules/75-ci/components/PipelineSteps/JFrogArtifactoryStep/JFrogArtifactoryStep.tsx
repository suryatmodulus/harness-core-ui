import React from 'react'
import type { IconName } from '@wings-software/uicore'
import { parse } from 'yaml'
import get from 'lodash-es/get'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/exports'
import type { UseStringsReturn } from 'framework/exports'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type { MultiTypeConnectorRef, Resources } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { loggerFor, ModuleName } from 'framework/exports'
import { JFrogArtifactoryStepBaseWithRef } from './JFrogArtifactoryStepBase'
import { JFrogArtifactoryStepInputSet } from './JFrogArtifactoryStepInputSet'
import { JFrogArtifactoryStepVariables, JFrogArtifactoryStepVariablesProps } from './JFrogArtifactoryStepVariables'
import { inputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './JFrogArtifactoryStepFunctionConfigs'
import { getConnectorSuggestions } from '../EditorSuggestionUtils'

const logger = loggerFor(ModuleName.CI)

export interface JFrogArtifactoryStepSpec {
  connectorRef: string
  target: string
  sourcePath: string
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypePullOption
  resources?: Resources
}

export interface JFrogArtifactoryStepData {
  identifier: string
  name?: string
  description?: string
  type: string
  timeout?: string
  spec: JFrogArtifactoryStepSpec
}

export interface JFrogArtifactoryStepSpecUI
  extends Omit<JFrogArtifactoryStepSpec, 'connectorRef' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // pull?: MultiTypeSelectOption
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface JFrogArtifactoryStepDataUI extends Omit<JFrogArtifactoryStepData, 'spec'> {
  spec: JFrogArtifactoryStepSpecUI
}

export interface JFrogArtifactoryStepProps {
  initialValues: JFrogArtifactoryStepData
  template?: JFrogArtifactoryStepData
  path?: string
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: JFrogArtifactoryStepData) => void
}

export class JFrogArtifactoryStep extends PipelineStep<JFrogArtifactoryStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this.invocationMap = new Map()
    this.invocationMap.set(/^.+step\.spec\.connectorRef$/, this.getConnectorList.bind(this))
  }

  protected type = StepType.JFrogArtifactory
  protected stepName = 'Upload Artifacts to JFrog Artifactory'
  protected stepIcon: IconName = 'service-artifactory'
  protected stepPaletteVisible = false

  protected defaultValues: JFrogArtifactoryStepData = {
    identifier: '',
    type: StepType.JFrogArtifactory as string,
    spec: {
      connectorRef: '',
      target: '',
      sourcePath: ''
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
      if (obj.type === StepType.JFrogArtifactory) {
        return getConnectorSuggestions(params, ['Artifactory'])
      }
    }
    return []
  }

  processFormData<JFrogArtifactoryStepDataUI>(data: JFrogArtifactoryStepDataUI): JFrogArtifactoryStepData {
    return getFormValuesInCorrectFormat<JFrogArtifactoryStepDataUI, JFrogArtifactoryStepData>(
      data,
      transformValuesFieldsConfig
    )
  }

  validateInputSet(
    data: JFrogArtifactoryStepData,
    template?: JFrogArtifactoryStepData,
    getString?: UseStringsReturn['getString']
  ): object {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<JFrogArtifactoryStepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <JFrogArtifactoryStepInputSet
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
        <JFrogArtifactoryStepVariables
          {...(customStepProps as JFrogArtifactoryStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <JFrogArtifactoryStepBaseWithRef
        initialValues={initialValues}
        stepViewType={stepViewType}
        onUpdate={onUpdate}
        ref={formikRef}
      />
    )
  }
}
