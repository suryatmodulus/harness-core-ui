import React from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import {
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption,
  ExpressionInput
} from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import type { ShellScriptFormData } from './shellScriptTypes'
import { ShellScriptMonacoField, ScriptType } from './ShellScriptMonaco'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const shellScriptType: SelectOption[] = [
  { label: 'Bash', value: 'Bash' },
  { label: 'PowerShell', value: 'PowerShell' }
]

export default function BaseShellScript(props: {
  formik: FormikProps<ShellScriptFormData>
  isNewStep: boolean
}): React.ReactElement {
  const {
    formik: { values: formValues, setFieldValue },
    isNewStep
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const scriptType: ScriptType = formValues.spec?.shell || 'Bash'

  return (
    <>
      <div className={cx(stepCss.formGroup, stepCss.md)}>
        <FormInput.InputWithIdentifier
          inputLabel={getString('pipelineSteps.stepNameLabel')}
          isIdentifierEditable={isNewStep}
        />
      </div>
      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormInput.Select
          items={shellScriptType}
          name="spec.shell"
          label={getString('scriptType')}
          placeholder={getString('scriptType')}
          disabled
        />
      </div>
      <div className={stepCss.formGroup}>
        <MultiTypeFieldSelector
          name="spec.source.spec.script"
          label={getString('script')}
          defaultValueToReset=""
          allowedTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
          expressionRender={() => {
            return (
              <ExpressionInput
                value={formValues?.spec?.source?.spec?.script || ''}
                name="spec.source.spec.script"
                onChange={value => setFieldValue('spec.source.spec.script', value)}
              />
            )
          }}
        >
          <ShellScriptMonacoField name="spec.source.spec.script" scriptType={scriptType} />
        </MultiTypeFieldSelector>
        {getMultiTypeFromValue(formValues.spec.source?.spec?.script) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.source?.spec?.script as string}
            type="String"
            variableName="spec.source.spec.script"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => setFieldValue('spec.source.spec.script', value)}
          />
        )}
      </div>
      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          multiTypeDurationProps={{ enableConfigureOptions: false, expressions }}
          className={stepCss.duration}
        />
        {getMultiTypeFromValue(formValues?.timeout) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec?.timeout as string}
            type="String"
            variableName="step.timeout"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => {
              setFieldValue('timeout', value)
            }}
          />
        )}
      </div>
    </>
  )
}
