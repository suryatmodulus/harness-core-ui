import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'

import type { FormikErrors } from 'formik'
import { get, isEmpty, omit, set } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StepElementConfig } from 'services/cd-ng'
import type { StringsMap } from 'stringTypes'
import FlagConfigurationInputSetStep from './FlagConfigurationInputSetStep'
import { FlagConfigurationStepWidgetWithRef } from './FlagConfigurationStepWidget'
import {
  FlagConfigurationStepVariablesView,
  FlagConfigurationStepVariablesViewProps
} from './FlagConfigurationStepVariablesView'
import {
  FlagConfigurationStepData,
  FlagConfigurationStepFormData,
  CFPipelineInstructionType,
  VariationMapping
} from './types'

export class FlagConfigurationStep extends PipelineStep<FlagConfigurationStepData> {
  renderStep(this: FlagConfigurationStep, props: StepProps<FlagConfigurationStepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, isNewStep, readonly } =
      props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <FlagConfigurationInputSetStep
          initialValues={this.processInitialValues(initialValues, true)}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
          stepViewType={stepViewType}
          readonly={!!inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
        />
      )
    }

    if (stepViewType === StepViewType.InputVariable) {
      return (
        <FlagConfigurationStepVariablesView
          {...(customStepProps as FlagConfigurationStepVariablesViewProps)}
          originalData={initialValues}
        />
      )
    }

    return (
      <FlagConfigurationStepWidgetWithRef
        initialValues={this.processInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        stepViewType={stepViewType}
        isNewStep={isNewStep}
        readonly={!!inputSetData?.readonly}
        isDisabled={readonly}
        ref={formikRef}
      />
    )
  }

  protected type = StepType.FlagConfiguration
  protected stepName = 'Flag Configuration'
  protected stepIcon: IconName = 'flag' // TODO: Use better icon
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.FlagConfiguration'
  protected isHarnessSpecific = true

  validateInputSet({
    data,
    template,
    getString
  }: ValidateInputSetProps<FlagConfigurationStepData>): FormikErrors<FlagConfigurationStepData> {
    const errors: FormikErrors<FlagConfigurationStepData> = { spec: {} }

    if (getMultiTypeFromValue(template?.spec?.feature) === MultiTypeInputType.RUNTIME && isEmpty(data?.spec?.feature)) {
      set(errors, 'spec.featureFlag', getString?.('fieldRequired', { field: 'featureFlag' }))
    }

    if (
      getMultiTypeFromValue(template?.spec?.environment) === MultiTypeInputType.RUNTIME &&
      isEmpty(data?.spec?.environment)
    ) {
      set(errors, 'spec.environment', getString?.('fieldRequired', { field: 'environment' }))
    }

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }

  protected defaultValues: FlagConfigurationStepData = {
    identifier: '',
    name: '',
    type: '',
    timeout: '10m',
    spec: {
      feature: '',
      environment: '',
      instructions: []
    }
  }

  private processInitialValues(
    initialValues: FlagConfigurationStepData,
    _forInputSet?: boolean
  ): FlagConfigurationStepFormData {
    const variationMappingInstructions = initialValues.spec.instructions?.filter(
      ({ type }) => type === CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP
    )

    const variationMappings = variationMappingInstructions?.length
      ? variationMappingInstructions
          .map(variationMappingInstruction => {
            const _targets = variationMappingInstruction.spec?.targets
            const _targetGroups = variationMappingInstruction.spec?.segments

            return {
              variationIdentifier: variationMappingInstruction.spec?.variation,
              instructionType: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP,
              ...(_targets?.length
                ? {
                    targets: _targets.map
                      ? _targets.map((identifier: string) => ({ identifier, name: identifier }))
                      : _targets
                  }
                : undefined),
              ...(_targetGroups?.length
                ? {
                    targetGroups: _targetGroups.map
                      ? _targetGroups.map((identifier: string) => ({ identifier, name: identifier }))
                      : _targetGroups
                  }
                : undefined)
            }
          })
          .reduce((map: Record<string, VariationMapping>, item: VariationMapping) => {
            map[item.variationIdentifier] = item
            return map
          }, {})
      : undefined

    const formData = {
      ...initialValues,
      spec: {
        ...(omit(initialValues.spec, 'instructions') as unknown as FlagConfigurationStepFormData),
        environment: initialValues.spec.environment,
        featureFlag: initialValues.spec.feature,
        state: initialValues.spec.instructions[0]?.spec?.state,
        defaultVariation: undefined, // TODO: Not yet supported by backend
        variationMappings
      }
    }

    return formData
  }

  processFormData(data: StepElementConfig): FlagConfigurationStepData {
    const _data = data as unknown as FlagConfigurationStepFormData
    const instructions: FlagConfigurationStepData['spec']['instructions'] = []

    instructions.push({
      identifier: `${CFPipelineInstructionType.SET_FEATURE_FLAG_STATE}Identifier`,
      type: CFPipelineInstructionType.SET_FEATURE_FLAG_STATE,
      spec: {
        state: toValue(_data.spec.state) // TODO: handle runtime input
      }
    })

    if (_data.spec.variationMappings) {
      if (String(_data.spec.variationMappings) === RUNTIME_INPUT_VALUE) {
        instructions.push({
          identifier: `${CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP}Identifier`,
          type: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP,
          spec: {
            variation: RUNTIME_INPUT_VALUE,
            targets: RUNTIME_INPUT_VALUE,
            segments: RUNTIME_INPUT_VALUE
          }
        })
      } else {
        Object.values(_data.spec.variationMappings).forEach((variationMapping, index) => {
          const _targets = variationMapping.targets
          const _targetGroups = variationMapping.targetGroups

          if (_targets?.length || _targetGroups?.length) {
            instructions.push({
              identifier: `${CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP}Identifier${index}`,
              type: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP,
              spec: {
                variation: variationMapping.variationIdentifier,
                targets: _targets?.length
                  ? _targets.map
                    ? _targets.map(entry => entry.identifier)
                    : _targets
                  : undefined,
                segments: _targetGroups?.length
                  ? _targetGroups.map
                    ? _targetGroups.map(entry => entry.identifier)
                    : _targetGroups
                  : undefined
              }
            })
          }
        })
      }
    }

    const spec = {
      feature: toValue(_data.spec.featureFlag),
      environment: toValue(_data.spec.environment),
      instructions
    }

    return { ...omit(data, ['spec']), spec }
  }
}

function toValue(option: unknown): string {
  return get(option, 'value', option)
}
