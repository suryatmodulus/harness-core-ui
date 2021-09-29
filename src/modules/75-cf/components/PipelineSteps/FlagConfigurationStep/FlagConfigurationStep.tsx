import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'

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
import { FlagConfigurationStepData, FlagConfigurationStepFormData, CFPipelineInstructionType } from './types'

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
    const state = initialValues.spec.instructions.find(
      ({ type }) => type === CFPipelineInstructionType.SET_FEATURE_FLAG_STATE
    )?.spec.state

    let defaultRules = undefined
    const defaultRulesOn = initialValues.spec.instructions.find(
      ({ type }) => type === CFPipelineInstructionType.SET_DEFAULT_ON_VARIATION
    )
    const defaultRulesOff = initialValues.spec.instructions.find(
      ({ type }) => type === CFPipelineInstructionType.SET_DEFAULT_OFF_VARIATION
    )

    if (defaultRulesOn || defaultRulesOff) {
      defaultRules = {
        on: defaultRulesOn ? defaultRulesOn.spec.variation : undefined,
        off: defaultRulesOn ? defaultRulesOn.spec.variation : undefined
      }
    }

    return {
      ...initialValues,
      spec: {
        ...(omit(initialValues.spec, 'instructions') as unknown as FlagConfigurationStepFormData),
        environment: initialValues.spec.environment,
        featureFlag: initialValues.spec.feature,
        state,
        defaultRules
      }
    }
  }

  processFormData(data: StepElementConfig): FlagConfigurationStepData {
    const _data = data as unknown as FlagConfigurationStepFormData
    const instructions: FlagConfigurationStepData['spec']['instructions'] = []

    if (_data.spec.state) {
      instructions.push({
        identifier: `${CFPipelineInstructionType.SET_FEATURE_FLAG_STATE}Identifier`,
        type: CFPipelineInstructionType.SET_FEATURE_FLAG_STATE,
        spec: {
          state: toValue(_data.spec.state) // TODO: handle runtime input
        }
      })
    }

    if (_data.spec.defaultRules?.on) {
      instructions.push({
        identifier: 'SetFeatureFlagOnVariation',
        type: CFPipelineInstructionType.SET_DEFAULT_ON_VARIATION,
        spec: {
          variation: toValue(_data.spec.defaultRules.on)
        }
      })
    }

    if (_data.spec.defaultRules?.off) {
      instructions.push({
        identifier: 'SetFeatureFlagOffVariation',
        type: CFPipelineInstructionType.SET_DEFAULT_OFF_VARIATION,
        spec: {
          variation: toValue(_data.spec.defaultRules.off)
        }
      })
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
