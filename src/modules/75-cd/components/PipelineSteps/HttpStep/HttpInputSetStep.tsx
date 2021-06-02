import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, FormInput } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import type { HttpStepFormData, HttpStepData } from './types'
import { httpStepType } from './HttpStepBase'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
export interface HttpInputSetStepProps {
  initialValues: HttpStepFormData
  onUpdate?: (data: HttpStepFormData) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: HttpStepData
  path: string
}

export default function HttpInputSetStep(props: HttpInputSetStepProps): React.ReactElement {
  const { template, path, readonly } = props
  const { getString } = useStrings()
  const prefix = isEmpty(path) ? '' : `${path}.`
  const { expressions } = useVariablesExpression()
  return (
    <React.Fragment>
      {getMultiTypeFromValue(template?.spec?.url) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('UrlLabel')}
            name={`${prefix}spec.url`}
            multiTextInputProps={{
              expressions,
              disabled: readonly,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.method) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormInput.MultiTypeInput
            label={getString('methodLabel')}
            name={`${prefix}spec.method`}
            useValue
            selectItems={httpStepType}
            multiTypeInputProps={{
              expressions,
              disabled: readonly,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.requestBody) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeTextAreaField
            label={getString('requestBodyLabel')}
            name={`${prefix}spec.requestBody`}
            multiTypeTextArea={{
              enableConfigureOptions: false,
              expressions,
              disabled: readonly,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.assertion) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('assertionLabel')}
            name={`${prefix}spec.assertion`}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              disabled: readonly,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}timeout`}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              expressions,
              disabled: readonly,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            disabled={readonly}
          />
        </div>
      ) : null}
    </React.Fragment>
  )
}
