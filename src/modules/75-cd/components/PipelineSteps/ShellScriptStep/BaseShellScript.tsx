import React from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ShellScriptMonacoField, ScriptType } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'

import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import type { ShellScriptFormData } from './shellScriptTypes'

import css from './ShellScript.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const shellScriptType: SelectOption[] = [
  { label: 'Bash', value: 'Bash' },
  { label: 'PowerShell', value: 'PowerShell' }
]

export default function BaseShellScript(props: {
  formik: FormikProps<ShellScriptFormData>
  isNewStep: boolean
  readonly?: boolean
}): React.ReactElement {
  const {
    formik: { values: formValues, setFieldValue },
    isNewStep,
    readonly
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const scriptType: ScriptType = formValues.spec?.shell || 'Bash'

  return (
    <>
      <div className={cx(stepCss.formGroup, stepCss.md)}>
        <FormInput.InputWithIdentifier
          inputLabel={getString('pipelineSteps.stepNameLabel')}
          isIdentifierEditable={isNewStep && !readonly}
          inputGroupProps={{ disabled: readonly }}
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
      <div className={cx(stepCss.formGroup, stepCss.alignStart)}>
        <MultiTypeFieldSelector
          name="spec.source.spec.script"
          label={getString('script')}
          defaultValueToReset=""
          disabled={readonly}
          allowedTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
          disableTypeSelection={readonly}
          skipRenderValueInExpressionLabel
          expressionRender={() => {
            return (
              <ShellScriptMonacoField
                name="spec.source.spec.script"
                scriptType={scriptType}
                disabled={readonly}
                expressions={expressions}
              />
            )
          }}
        >
          <ShellScriptMonacoField
            name="spec.source.spec.script"
            scriptType={scriptType}
            disabled={readonly}
            expressions={expressions}
          />
        </MultiTypeFieldSelector>
        {getMultiTypeFromValue(formValues.spec.source?.spec?.script) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.source?.spec?.script as string}
            type="String"
            variableName="spec.source.spec.script"
            className={css.minConfigBtn}
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
          multiTypeDurationProps={{ enableConfigureOptions: false, expressions, disabled: readonly }}
          className={stepCss.duration}
          disabled={readonly}
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
