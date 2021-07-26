import React from 'react'
import { SelectOption, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import cx from 'classnames'

import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { HttpStepFormData } from './types'
import css from './HttpStep.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const httpStepType: SelectOption[] = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'HEAD', label: 'HEAD' },
  { value: 'OPTIONS', label: 'OPTIONS' }
]

export default function HttpStepBase(props: {
  formik: FormikProps<HttpStepFormData>
  isNewStep?: boolean
  readonly?: boolean
}): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const {
    formik: { values: formValues, setFieldValue },
    isNewStep = true,
    readonly
  } = props

  return (
    <div className={stepCss.stepPanel}>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.InputWithIdentifier
          inputLabel={getString('name')}
          isIdentifierEditable={isNewStep && !readonly}
          inputGroupProps={{
            disabled: readonly
          }}
        />
      </div>
      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          multiTypeDurationProps={{ enableConfigureOptions: false, expressions, disabled: readonly }}
          disabled={readonly}
        />
        {getMultiTypeFromValue(formValues.timeout) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.timeout || ''}
            type="String"
            variableName="timeout"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => setFieldValue('timeout', value)}
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={stepCss.noLookDivider} />

      <div className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.url"
          label={getString('UrlLabel')}
          disabled={readonly}
          multiTextInputProps={{ expressions, disabled: readonly }}
        />
        {getMultiTypeFromValue(formValues.spec.url) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.url}
            type="String"
            variableName="spec.url"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => setFieldValue('spec.url', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormInput.MultiTypeInput
          selectItems={httpStepType}
          disabled={readonly}
          multiTypeInputProps={{ expressions, disabled: readonly }}
          label={getString('methodLabel')}
          name="spec.method"
        />
        {getMultiTypeFromValue(formValues.spec.method) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.method as string}
            type="String"
            variableName="spec.method"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => setFieldValue('spec.method', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <div className={stepCss.formGroup}>
        <FormMultiTypeTextAreaField
          name="spec.requestBody"
          label={getString('requestBodyLabel')}
          className={css.requestBody}
          multiTypeTextArea={{ enableConfigureOptions: false, expressions, disabled: readonly }}
        />
        {getMultiTypeFromValue(formValues.spec.requestBody) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.requestBody}
            type="String"
            variableName="spec.requestBody"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => setFieldValue('spec.requestBody', value)}
            isReadonly={readonly}
          />
        )}
      </div>
    </div>
  )
}
