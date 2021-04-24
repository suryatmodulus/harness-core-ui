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
  MultiTypeConnectorRef,
  Resources,
  MultiTypeArchiveFormatOption,
  MultiTypeSelectOption
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { RestoreCacheS3StepBaseWithRef } from './RestoreCacheS3StepBase'
import { RestoreCacheS3StepInputSet } from './RestoreCacheS3StepInputSet'
import { RestoreCacheS3StepVariables, RestoreCacheS3StepVariablesProps } from './RestoreCacheS3StepVariables'
import { inputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './RestoreCacheS3StepFunctionConfigs'
import { getConnectorSuggestions } from '../EditorSuggestionUtils'

const logger = loggerFor(ModuleName.CI)

export interface RestoreCacheS3StepSpec {
  connectorRef: string
  region: string
  bucket: string
  key: string
  endpoint?: string
  archiveFormat?: MultiTypeArchiveFormatOption
  pathStyle?: boolean
  failIfKeyNotFound?: boolean
  resources?: Resources
}

export interface RestoreCacheS3StepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: RestoreCacheS3StepSpec
}

export interface RestoreCacheS3StepSpecUI
  extends Omit<RestoreCacheS3StepSpec, 'connectorRef' | 'archiveFormat' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  archiveFormat?: MultiTypeSelectOption
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface RestoreCacheS3StepDataUI extends Omit<RestoreCacheS3StepData, 'spec'> {
  spec: RestoreCacheS3StepSpecUI
}

export interface RestoreCacheS3StepProps {
  initialValues: RestoreCacheS3StepData
  template?: RestoreCacheS3StepData
  path?: string
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: RestoreCacheS3StepData) => void
}

export class RestoreCacheS3Step extends PipelineStep<RestoreCacheS3StepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this.invocationMap = new Map()
    this.invocationMap.set(/^.+step\.spec\.connectorRef$/, this.getConnectorList.bind(this))
  }

  protected type = StepType.RestoreCacheS3
  protected stepName = 'Restore Cache from S3'
  protected stepIcon: IconName = 'restore-cache-s3'
  protected stepPaletteVisible = false

  protected defaultValues: RestoreCacheS3StepData = {
    identifier: '',
    type: StepType.RestoreCacheS3 as string,
    spec: {
      connectorRef: '',
      region: '',
      bucket: '',
      key: ''
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
      if (obj.type === StepType.RestoreCacheS3 || obj.type === StepType.SaveCacheS3 || obj.type === StepType.ECR) {
        return getConnectorSuggestions(params, ['Aws'])
      }
    }
    return []
  }

  processFormData<T>(data: T): RestoreCacheS3StepData {
    return getFormValuesInCorrectFormat<T, RestoreCacheS3StepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet(
    data: RestoreCacheS3StepData,
    template?: RestoreCacheS3StepData,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<RestoreCacheS3StepData> {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<RestoreCacheS3StepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, readonly } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <RestoreCacheS3StepInputSet
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
        <RestoreCacheS3StepVariables
          {...(customStepProps as RestoreCacheS3StepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <RestoreCacheS3StepBaseWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }
}
